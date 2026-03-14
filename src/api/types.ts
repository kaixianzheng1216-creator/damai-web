import type { AxiosRequestConfig } from 'axios'

export interface RequestConfig extends AxiosRequestConfig {
  showError?: boolean
  rawResponse?: boolean
}
