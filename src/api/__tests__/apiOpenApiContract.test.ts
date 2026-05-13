import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest'
import {
  createAdmin,
  createPassenger,
  login,
  sendVerifyCode,
  updateAdminStatus,
  type AdminCreateRequest,
  type LoginParams,
  type LoginResponse,
  type PassengerCreateRequest,
  type SendCodeParams,
} from '@/api/account'
import {
  createEvent,
  createNotice,
  createService,
  createServiceOption,
  adminCreateTicketType,
  fetchAdminNoticesPage,
  fetchAdminServiceList,
  fetchEventPage,
  followEvent,
  checkIsFollowedEvent,
  unfollowEvent,
  updateCityFeatured,
  updateServiceOption,
  type EventCreateRequest,
  type EventPageRequest,
  type NoticeCreateRequest,
  type NoticePageRequest,
  type PageResponseNoticeVO,
  type PageResponseEventVO,
  type ServiceGuaranteeCreateRequest,
  type ServiceOptionCreateRequest,
  type TicketTypeCreateRequest,
  type ServiceOptionUpdateRequest,
} from '@/api/event'
import {
  cancelAdminWorkOrder,
  createTicketOrder,
  createRefund,
  fetchAdminWorkOrderById,
  fetchAdminWorkOrderPage,
  fetchMyPurchaseCounts,
  type OrderStatusVO,
  type PageResponseWorkOrderVO,
  type PaymentCreateRequest,
  type RefundCreateRequest,
  type RefundVO,
  type TicketOrderCreateRequest,
  type WorkOrderDetailVO,
  type WorkOrderPageRequest,
} from '@/api/trade'
import {
  adminCheckinTicket,
  fetchMyTicketPage,
  type PageResponseTicketVO,
  type TicketPageRequest,
} from '@/api/ticket'

const requestMock = vi.hoisted(() => ({
  get: vi.fn(() => Promise.resolve(undefined)),
  post: vi.fn(() => Promise.resolve(undefined)),
  put: vi.fn(() => Promise.resolve(undefined)),
  patch: vi.fn(() => Promise.resolve(undefined)),
  del: vi.fn(() => Promise.resolve(undefined)),
}))

vi.mock('@/api/request', () => ({
  request: requestMock,
}))

type ServiceName = 'account' | 'auth' | 'event' | 'order' | 'ticket'
type RequestMethod = keyof typeof requestMock
type OpenApiMethod = 'delete' | 'get' | 'patch' | 'post' | 'put'

interface OpenApiSchema {
  $ref?: string
  type?: string
  properties?: Record<string, OpenApiSchema>
  required?: string[]
}

interface OpenApiContent {
  schema?: OpenApiSchema
}

interface OpenApiParameter {
  name: string
  in?: string
  required?: boolean
  schema?: OpenApiSchema
}

interface OpenApiOperation {
  parameters?: OpenApiParameter[]
  requestBody?: {
    content?: Record<string, OpenApiContent>
  }
  responses?: Record<
    string,
    {
      content?: Record<string, OpenApiContent>
    }
  >
}

interface OpenApiDoc {
  paths: Record<string, Partial<Record<OpenApiMethod, OpenApiOperation>>>
  components?: {
    schemas?: Record<string, OpenApiSchema>
  }
}

interface OperationContract {
  doc: OpenApiDoc
  operation: OpenApiOperation
}

interface ExpectRequestOptions {
  service: ServiceName
  method: RequestMethod
  docPath: string
  pathParams?: Record<string, string>
  query?: Record<string, unknown>
  body?: unknown
  requestSchema?: string
  requestBodyType?: string
  responseSchema: string
}

const DOCS_DIR = join(process.cwd(), 'docs', 'openapi')

const gatewayPrefixByService: Record<ServiceName, string> = {
  account: '/api/account',
  auth: '/api/auth',
  event: '/api/event',
  order: '/api/order',
  ticket: '/api/ticket',
}

const openApiMethodByRequestMethod: Record<RequestMethod, OpenApiMethod> = {
  get: 'get',
  post: 'post',
  put: 'put',
  patch: 'patch',
  del: 'delete',
}

const openApiDocs = readdirSync(DOCS_DIR)
  .filter((fileName) => fileName.endsWith('_OpenAPI.json'))
  .map((fileName) => JSON.parse(readFileSync(join(DOCS_DIR, fileName), 'utf8')) as OpenApiDoc)

function schemaName(ref: string | undefined): string | undefined {
  return ref?.split('/').at(-1)
}

function findOperation(docPath: string, method: OpenApiMethod): OperationContract {
  for (const doc of openApiDocs) {
    const operation = doc.paths[docPath]?.[method]
    if (operation) {
      return { doc, operation }
    }
  }

  throw new Error(`OpenAPI operation not found: ${method.toUpperCase()} ${docPath}`)
}

function getJsonSchema(operation: OpenApiOperation): OpenApiSchema | undefined {
  return (
    operation.requestBody?.content?.['application/json']?.schema ??
    operation.requestBody?.content?.['*/*']?.schema
  )
}

function getResponseSchema(operation: OpenApiOperation): OpenApiSchema | undefined {
  return (
    operation.responses?.['200']?.content?.['*/*']?.schema ??
    operation.responses?.['200']?.content?.['application/json']?.schema
  )
}

function getSchema(doc: OpenApiDoc, name: string): OpenApiSchema {
  const schema = doc.components?.schemas?.[name]
  if (!schema) {
    throw new Error(`OpenAPI schema not found: ${name}`)
  }

  return schema
}

function materializePath(docPath: string, pathParams: Record<string, string> = {}): string {
  return docPath.replace(/\{(\w+)}/g, (_match, key: string) => pathParams[key] ?? `{${key}}`)
}

function expectBodyMatchesSchema(doc: OpenApiDoc, schema: string, body: unknown) {
  expect(body).toBeTypeOf('object')
  expect(Array.isArray(body)).toBe(false)
  expect(body).not.toBeNull()

  const objectBody = body as Record<string, unknown>
  const contractSchema = getSchema(doc, schema)
  const propertyNames = new Set(Object.keys(contractSchema.properties ?? {}))

  for (const key of Object.keys(objectBody)) {
    expect(propertyNames.has(key), `${schema} should define body field "${key}"`).toBe(true)
  }

  for (const key of contractSchema.required ?? []) {
    expect(objectBody, `${schema} requires body field "${key}"`).toHaveProperty(key)
  }
}

function expectQueryMatchesOperation(operation: OpenApiOperation, query: Record<string, unknown>) {
  const queryParamNames = new Set(
    operation.parameters?.filter((parameter) => parameter.in === 'query').map(({ name }) => name),
  )

  for (const key of Object.keys(query)) {
    expect(queryParamNames.has(key), `OpenAPI should define query param "${key}"`).toBe(true)
  }
}

function expectPathParamsMatchOperation(
  operation: OpenApiOperation,
  pathParams: Record<string, string>,
) {
  const pathParameters = operation.parameters?.filter((parameter) => parameter.in === 'path') ?? []

  for (const parameter of pathParameters) {
    if (parameter.required) {
      expect(pathParams, `Missing path param "${parameter.name}"`).toHaveProperty(parameter.name)
    }
  }
}

function getRequestCall(method: RequestMethod): unknown[] {
  const calls = requestMock[method].mock.calls
  expect(calls).toHaveLength(1)
  return calls[0]
}

function expectRequestMatchesOpenApi(options: ExpectRequestOptions) {
  const openApiMethod = openApiMethodByRequestMethod[options.method]
  const { doc, operation } = findOperation(options.docPath, openApiMethod)
  const call = getRequestCall(options.method)
  const expectedUrl = `${gatewayPrefixByService[options.service]}${materializePath(
    options.docPath,
    options.pathParams,
  )}`

  expect(call[0]).toBe(expectedUrl)
  expectPathParamsMatchOperation(operation, options.pathParams ?? {})

  if (options.query) {
    expect(call[1]).toEqual({ params: options.query })
    expectQueryMatchesOperation(operation, options.query)
  }

  const requestSchema = getJsonSchema(operation)

  if (options.requestSchema) {
    expect(schemaName(requestSchema?.['$ref'])).toBe(options.requestSchema)
    expectBodyMatchesSchema(doc, options.requestSchema, options.body)
    expect(call[1]).toEqual(options.body)
  }

  if (options.requestBodyType) {
    expect(requestSchema?.type).toBe(options.requestBodyType)
    expect(call[1]).toEqual(options.body)
  }

  if (!options.requestSchema && !options.requestBodyType && options.body !== undefined) {
    expect(call[1]).toEqual(options.body)
  }

  expect(schemaName(getResponseSchema(operation)?.['$ref'])).toBe(options.responseSchema)
}

afterEach(() => {
  vi.clearAllMocks()
})

describe('API OpenAPI contracts', () => {
  it('covers activity page, creation, ticket type, featured city, and service option endpoints', async () => {
    const eventPageParams = {
      page: 1,
      size: 12,
      cityId: '310100',
      categoryId: '1',
      sortType: 1,
    } satisfies EventPageRequest
    const eventCreateBody = {
      categoryId: '1',
      venueId: '2',
      cityId: '310100',
      name: '演唱会',
      coverUrl: 'https://example.com/cover.jpg',
    } satisfies EventCreateRequest
    const ticketTypeBody = {
      name: '看台',
      salePrice: 38800,
      totalQty: 100,
      orderLimit: 2,
      accountLimit: 4,
    } satisfies TicketTypeCreateRequest
    const optionUpdateBody = {
      name: '可退',
      description: '支持限时退票',
      isBooleanType: 1,
    } satisfies ServiceOptionUpdateRequest

    const pagePromise = fetchEventPage(eventPageParams)
    expectTypeOf(pagePromise).toEqualTypeOf<Promise<PageResponseEventVO>>()
    await pagePromise
    expectRequestMatchesOpenApi({
      service: 'event',
      method: 'get',
      docPath: '/front/events/page',
      query: eventPageParams,
      responseSchema: 'ApiResponsePageResponseEventVO',
    })

    vi.clearAllMocks()
    requestMock.post.mockResolvedValueOnce(123)
    const eventIdPromise = createEvent(eventCreateBody)
    expectTypeOf(eventIdPromise).toEqualTypeOf<Promise<string>>()
    await expect(eventIdPromise).resolves.toBe('123')
    expectRequestMatchesOpenApi({
      service: 'event',
      method: 'post',
      docPath: '/admin/events',
      body: eventCreateBody,
      requestSchema: 'EventCreateRequest',
      responseSchema: 'ApiResponseLong',
    })

    vi.clearAllMocks()
    requestMock.post.mockResolvedValueOnce(456)
    await expect(adminCreateTicketType('123', '456', ticketTypeBody)).resolves.toBe('456')
    expectRequestMatchesOpenApi({
      service: 'event',
      method: 'post',
      docPath: '/admin/events/{id}/sessions/{sessionId}/ticket-types',
      pathParams: { id: '123', sessionId: '456' },
      body: ticketTypeBody,
      requestSchema: 'TicketTypeCreateRequest',
      responseSchema: 'ApiResponseLong',
    })

    vi.clearAllMocks()
    await updateCityFeatured('310100', 1)
    expectRequestMatchesOpenApi({
      service: 'event',
      method: 'patch',
      docPath: '/admin/cities/{id}/featured',
      pathParams: { id: '310100' },
      body: { isFeatured: 1 },
      requestSchema: 'FeaturedUpdateRequest',
      responseSchema: 'ApiResponseVoid',
    })

    vi.clearAllMocks()
    await updateServiceOption('service-1', 'option-1', optionUpdateBody)
    expectRequestMatchesOpenApi({
      service: 'event',
      method: 'put',
      docPath: '/admin/services/options/{id}',
      pathParams: { id: 'option-1' },
      body: optionUpdateBody,
      requestSchema: 'ServiceGuaranteeOptionUpdateRequest',
      responseSchema: 'ApiResponseVoid',
    })
  })

  it('covers order creation and purchase count endpoints', async () => {
    const orderCreateBody = {
      eventId: '1',
      venueId: '2',
      sessionId: '3',
      ticketTypeId: '4',
      passengerIds: ['5', '6'],
    } satisfies TicketOrderCreateRequest

    const orderStatus: OrderStatusVO = {
      orderId: 'order-1',
      status: 1,
    }
    requestMock.post.mockResolvedValueOnce(orderStatus)

    const createOrderPromise = createTicketOrder(orderCreateBody)
    expectTypeOf(createOrderPromise).toEqualTypeOf<Promise<OrderStatusVO>>()
    await expect(createOrderPromise).resolves.toEqual(orderStatus)
    expectRequestMatchesOpenApi({
      service: 'order',
      method: 'post',
      docPath: '/front/ticket-orders',
      body: orderCreateBody,
      requestSchema: 'TicketOrderCreateRequest',
      responseSchema: 'ApiResponseOrderStatusVO',
    })

    vi.clearAllMocks()
    await fetchMyPurchaseCounts(['4', '7'])
    expect(requestMock.get).toHaveBeenCalledWith('/api/order/front/ticket-orders/purchase-counts', {
      params: { ticketTypeIds: ['4', '7'] },
    })
    const { operation } = findOperation('/front/ticket-orders/purchase-counts', 'get')
    expectQueryMatchesOperation(operation, { ticketTypeIds: ['4', '7'] })
    expect(schemaName(getResponseSchema(operation)?.['$ref'])).toBe('ApiResponseMapLongInteger')
  })

  it('covers ticket page and check-in endpoints', async () => {
    const ticketPageParams = {
      page: 1,
      size: 10,
      eventId: '1',
      status: 1,
    } satisfies TicketPageRequest

    const pagePromise = fetchMyTicketPage(ticketPageParams)
    expectTypeOf(pagePromise).toEqualTypeOf<Promise<PageResponseTicketVO>>()
    await pagePromise
    expectRequestMatchesOpenApi({
      service: 'ticket',
      method: 'get',
      docPath: '/front/tickets/my',
      query: ticketPageParams,
      responseSchema: 'ApiResponsePageResponseTicketVO',
    })

    vi.clearAllMocks()
    await adminCheckinTicket('qr-token')
    expectRequestMatchesOpenApi({
      service: 'ticket',
      method: 'post',
      docPath: '/admin/tickets/checkin/{qrCodeToken}',
      pathParams: { qrCodeToken: 'qr-token' },
      responseSchema: 'ApiResponseVoid',
    })
  })

  it('covers admin work order and refund endpoints', async () => {
    const workOrderPageParams = {
      page: 1,
      size: 10,
      userId: 'user-1',
      status: 1,
      sortField: 'createAt',
      sortOrder: 'desc',
    } satisfies WorkOrderPageRequest
    const refundBody = {
      reason: '行程冲突',
    } satisfies RefundCreateRequest

    const workOrderPagePromise = fetchAdminWorkOrderPage(workOrderPageParams)
    expectTypeOf(workOrderPagePromise).toEqualTypeOf<Promise<PageResponseWorkOrderVO>>()
    await workOrderPagePromise
    expectRequestMatchesOpenApi({
      service: 'order',
      method: 'get',
      docPath: '/admin/work-orders',
      query: workOrderPageParams,
      responseSchema: 'ApiResponsePageResponseWorkOrderVO',
    })

    vi.clearAllMocks()
    const detailPromise = fetchAdminWorkOrderById('work-order-1')
    expectTypeOf(detailPromise).toEqualTypeOf<Promise<WorkOrderDetailVO>>()
    await detailPromise
    expectRequestMatchesOpenApi({
      service: 'order',
      method: 'get',
      docPath: '/admin/work-orders/{id}',
      pathParams: { id: 'work-order-1' },
      responseSchema: 'ApiResponseWorkOrderDetailVO',
    })

    vi.clearAllMocks()
    await cancelAdminWorkOrder('work-order-1')
    expectRequestMatchesOpenApi({
      service: 'order',
      method: 'post',
      docPath: '/admin/work-orders/{id}/close',
      pathParams: { id: 'work-order-1' },
      responseSchema: 'ApiResponseVoid',
    })

    vi.clearAllMocks()
    const refundResponse: RefundVO = {
      id: 'refund-1',
      refundNo: 'REF-1',
      paymentId: 'payment-1',
      orderId: 'order-1',
      userId: 'user-1',
      amount: 199,
      reason: '行程冲突',
      channel: 1,
      channelLabel: '支付宝',
      outRefundNo: 'OUT-1',
      channelRefundNo: '',
      status: 0,
      statusLabel: '退款中',
      createAt: '2026-04-28T10:00:00.000Z',
    }
    requestMock.post.mockResolvedValueOnce(refundResponse)
    const refundPromise = createRefund('order-1', refundBody)
    expectTypeOf(refundPromise).toEqualTypeOf<Promise<RefundVO>>()
    await expect(refundPromise).resolves.toEqual(refundResponse)
    expectRequestMatchesOpenApi({
      service: 'order',
      method: 'post',
      docPath: '/front/ticket-orders/{id}/refund',
      pathParams: { id: 'order-1' },
      body: refundBody,
      requestSchema: 'RefundCreateRequest',
      responseSchema: 'ApiResponseRefundVO',
    })
  })

  it('covers service guarantee, follow, and notice endpoints', async () => {
    const serviceBody = {
      name: '安心退',
      sortOrder: 1,
    } satisfies ServiceGuaranteeCreateRequest
    const optionBody = {
      name: '可退',
      description: '支持限时退票',
      isBooleanType: 1,
    } satisfies ServiceOptionCreateRequest
    const noticeBody = {
      type: 1,
      name: '实名购票',
      sortOrder: 1,
    } satisfies NoticeCreateRequest
    const noticePageParams = {
      page: 1,
      size: 10,
      type: 1,
    } satisfies NoticePageRequest

    await fetchAdminServiceList()
    expectRequestMatchesOpenApi({
      service: 'event',
      method: 'get',
      docPath: '/admin/services',
      responseSchema: 'ApiResponseListServiceGuaranteeVO',
    })

    vi.clearAllMocks()
    requestMock.post.mockResolvedValueOnce(202)
    await expect(createService(serviceBody)).resolves.toBe('202')
    expectRequestMatchesOpenApi({
      service: 'event',
      method: 'post',
      docPath: '/admin/services',
      body: serviceBody,
      requestSchema: 'ServiceGuaranteeCreateRequest',
      responseSchema: 'ApiResponseLong',
    })

    vi.clearAllMocks()
    requestMock.post.mockResolvedValueOnce(303)
    await expect(createServiceOption('service-1', optionBody)).resolves.toBe('303')
    expectRequestMatchesOpenApi({
      service: 'event',
      method: 'post',
      docPath: '/admin/services/{serviceId}/options',
      pathParams: { serviceId: 'service-1' },
      body: optionBody,
      requestSchema: 'ServiceGuaranteeOptionCreateRequest',
      responseSchema: 'ApiResponseLong',
    })

    vi.clearAllMocks()
    await followEvent({ eventId: 'event-1' })
    expectRequestMatchesOpenApi({
      service: 'event',
      method: 'post',
      docPath: '/front/user-follows/events',
      body: { eventId: 'event-1' },
      requestSchema: 'UserFollowEventRequest',
      responseSchema: 'ApiResponseVoid',
    })

    vi.clearAllMocks()
    await checkIsFollowedEvent('event-1')
    expectRequestMatchesOpenApi({
      service: 'event',
      method: 'get',
      docPath: '/front/user-follows/events/{eventId}/check',
      pathParams: { eventId: 'event-1' },
      responseSchema: 'ApiResponseBoolean',
    })

    vi.clearAllMocks()
    await unfollowEvent('event-1')
    expectRequestMatchesOpenApi({
      service: 'event',
      method: 'del',
      docPath: '/front/user-follows/events/{eventId}',
      pathParams: { eventId: 'event-1' },
      responseSchema: 'ApiResponseVoid',
    })

    vi.clearAllMocks()
    const noticePagePromise = fetchAdminNoticesPage(noticePageParams)
    expectTypeOf(noticePagePromise).toEqualTypeOf<Promise<PageResponseNoticeVO>>()
    await noticePagePromise
    expectRequestMatchesOpenApi({
      service: 'event',
      method: 'get',
      docPath: '/admin/notices/page',
      query: noticePageParams,
      responseSchema: 'ApiResponsePageResponseNoticeVO',
    })

    vi.clearAllMocks()
    requestMock.post.mockResolvedValueOnce(404)
    await expect(createNotice(noticeBody)).resolves.toBe('404')
    expectRequestMatchesOpenApi({
      service: 'event',
      method: 'post',
      docPath: '/admin/notices',
      body: noticeBody,
      requestSchema: 'NoticeCreateRequest',
      responseSchema: 'ApiResponseLong',
    })
  })

  it('covers auth and account endpoints with raw ID normalization', async () => {
    const codeBody = {
      mobile: '13800138000',
      accountType: 'user',
    } satisfies SendCodeParams
    const loginBody = {
      mobile: '13800138000',
      code: '123456',
      accountType: 'user',
    } satisfies LoginParams
    const passengerBody = {
      name: '张三',
      idType: 1,
      idNo: '110101199001011234',
    } satisfies PassengerCreateRequest
    const adminBody = {
      mobile: '13900139000',
      username: 'operator',
    } satisfies AdminCreateRequest

    await sendVerifyCode(codeBody)
    expectRequestMatchesOpenApi({
      service: 'auth',
      method: 'post',
      docPath: '/auth/verify-code',
      body: codeBody,
      requestSchema: 'SendVerifyCodeRequest',
      responseSchema: 'ApiResponseVoid',
    })

    vi.clearAllMocks()
    const loginResponse: LoginResponse = {
      token: 'token',
      user: {
        id: '1',
        username: '用户',
        mobile: '13800138000',
        avatarUrl: '',
        status: 1,
        statusLabel: '正常',
      },
    }
    requestMock.post.mockResolvedValueOnce(loginResponse)
    const loginPromise = login(loginBody)
    expectTypeOf(loginPromise).toEqualTypeOf<Promise<LoginResponse>>()
    await expect(loginPromise).resolves.toEqual(loginResponse)
    expectRequestMatchesOpenApi({
      service: 'auth',
      method: 'post',
      docPath: '/auth/login',
      body: loginBody,
      requestSchema: 'LoginWithCodeRequest',
      responseSchema: 'ApiResponseLoginResponse',
    })

    vi.clearAllMocks()
    requestMock.post.mockResolvedValueOnce(789)
    await expect(createPassenger(passengerBody)).resolves.toBe('789')
    expectRequestMatchesOpenApi({
      service: 'account',
      method: 'post',
      docPath: '/front/passenger',
      body: passengerBody,
      requestSchema: 'PassengerCreateRequest',
      responseSchema: 'ApiResponseLong',
    })

    vi.clearAllMocks()
    requestMock.post.mockResolvedValueOnce(101)
    await expect(createAdmin(adminBody)).resolves.toBe('101')
    expectRequestMatchesOpenApi({
      service: 'account',
      method: 'post',
      docPath: '/admin/admin',
      body: adminBody,
      requestSchema: 'AdminCreateRequest',
      responseSchema: 'ApiResponseLong',
    })

    vi.clearAllMocks()
    await updateAdminStatus('101', 0)
    expectRequestMatchesOpenApi({
      service: 'account',
      method: 'put',
      docPath: '/admin/admin/{id}/status',
      pathParams: { id: '101' },
      body: 0,
      requestBodyType: 'integer',
      responseSchema: 'ApiResponseVoid',
    })
  })

  it('keeps payment request typing aligned with the order OpenAPI schema', () => {
    const paymentBody = {
      channel: 1,
      payMethod: 1,
    } satisfies PaymentCreateRequest

    const { doc, operation } = findOperation('/front/ticket-orders/{id}/pay', 'post')
    expect(schemaName(getJsonSchema(operation)?.['$ref'])).toBe('PaymentCreateRequest')
    expectBodyMatchesSchema(doc, 'PaymentCreateRequest', paymentBody)
    expect(schemaName(getResponseSchema(operation)?.['$ref'])).toBe('ApiResponsePaymentVO')
  })
})
