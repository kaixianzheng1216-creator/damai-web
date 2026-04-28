import { describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import type { ColumnDef } from '@tanstack/vue-table'
import DataTableCrud from '@/components/admin/DataTableCrud.vue'
import CheckoutPaymentPanel from '@/components/features/checkout/CheckoutPaymentPanel.vue'
import SearchFilterPanel from '@/components/features/search/SearchFilterPanel.vue'
import ProfileInfoSection from '@/components/features/profile/ProfileInfoSection.vue'
import type { ProfileInfo } from '@/api/account'
import { PAYMENT_CHANNELS, PAYMENT_COPY, PAYMENT_METHODS } from '@/constants'

const findButtonByText = (wrapper: VueWrapper, text: string) => {
  const button = wrapper.findAll('button').find((item) => item.text().includes(text))
  if (!button) {
    throw new Error(`Button with text "${text}" was not found`)
  }
  return button
}

describe('component smoke coverage', () => {
  it('renders an admin table and emits create / row-click events', async () => {
    interface Row {
      id: string
      name: string
    }

    const columns: ColumnDef<Row>[] = [{ accessorKey: 'name', header: '名称' }]
    const row = { id: '1', name: 'Alpha' }
    const wrapper = mount(DataTableCrud<Row>, {
      props: {
        columns,
        data: [row],
        title: '测试列表',
        showPagination: false,
      },
    })

    expect(wrapper.text()).toContain('测试列表')
    expect(wrapper.text()).toContain('Alpha')

    await findButtonByText(wrapper, '新建').trigger('click')
    expect(wrapper.emitted('create')).toHaveLength(1)

    await wrapper.get('tbody tr').trigger('click')
    expect(wrapper.emitted('row-click')?.[0]).toEqual([row])
  })

  it('emits checkout payment actions from visible controls', async () => {
    const wrapper = mount(CheckoutPaymentPanel, {
      props: {
        selectedChannel: PAYMENT_CHANNELS.ALIPAY,
        selectedMethod: PAYMENT_METHODS.QR_CODE,
        isPending: true,
        isPaid: false,
        isCancelled: false,
        isClosed: false,
        isCreatingPayment: false,
        isCancellingOrder: false,
      },
    })

    expect(wrapper.text()).toContain(PAYMENT_COPY.selectPaymentChannel)

    await findButtonByText(wrapper, PAYMENT_COPY.qrPay).trigger('click')
    await findButtonByText(wrapper, PAYMENT_COPY.cancelOrder).trigger('click')
    await findButtonByText(wrapper, PAYMENT_COPY.backToOrders).trigger('click')

    expect(wrapper.emitted('createPayment')).toHaveLength(1)
    expect(wrapper.emitted('cancelOrder')).toHaveLength(1)
    expect(wrapper.emitted('goOrders')).toHaveLength(1)
  })

  it('emits search filter selections from user-visible buttons', async () => {
    const wrapper = mount(SearchFilterPanel, {
      props: {
        cityOptions: [
          { label: '全部', value: undefined },
          { label: '上海', value: 'shanghai' },
        ],
        parentCategoryOptions: [{ label: '演唱会', value: 'concert' }],
        childCategoryOptions: [{ label: '流行', value: 'pop' }],
        timeOptions: [{ label: '今天', value: 1 }],
        cityId: undefined,
        categoryId: undefined,
        selectedParentCategoryId: undefined,
        timeType: undefined,
      },
    })

    await findButtonByText(wrapper, '上海').trigger('click')
    await findButtonByText(wrapper, '演唱会').trigger('click')
    await findButtonByText(wrapper, '今天').trigger('click')

    expect(wrapper.emitted('cityChange')?.[0]).toEqual(['shanghai'])
    expect(wrapper.emitted('parentCategoryChange')?.[0]).toEqual(['concert'])
    expect(wrapper.emitted('timeSelect')?.[0]).toEqual([1])
  })

  it('renders profile info and emits save / avatar-selected events', async () => {
    const form: ProfileInfo = {
      nickname: '小麦',
      gender: 'male',
      birthYear: '1998',
      birthMonth: '8',
      birthDay: '18',
    }
    const wrapper = mount(ProfileInfoSection, {
      props: {
        form,
        displayAvatar: '/avatar.png',
        years: ['1998'],
        months: ['8'],
        days: ['18'],
      },
    })

    expect(wrapper.get('img').attributes('alt')).toBe('个人头像')

    await findButtonByText(wrapper, '保存').trigger('click')
    expect(wrapper.emitted('save')).toHaveLength(1)

    const avatar = new File(['avatar'], 'avatar.png', { type: 'image/png' })
    const input = wrapper.get('input[type="file"]')
    Object.defineProperty(input.element, 'files', {
      value: [avatar],
      configurable: true,
    })
    await input.trigger('change')

    expect(wrapper.emitted('avatar-selected')?.[0]).toEqual([avatar])
  })
})
