/* tslint:disable  no-unbound-method  */

import {QIO} from '@qio/core'
import Axios, {AxiosError, AxiosRequestConfig, AxiosResponse} from 'axios'
export * from 'axios'

export const request = (config: AxiosRequestConfig) =>
  QIO.accessM((_: IHttpEnv) => _.http.request(config))

export interface IHttpEnv {
  http: {
    request(config: AxiosRequestConfig): QIO<AxiosResponse, Error | AxiosError>
  }
}

export const httpEnv = {
  request: QIO.encaseP(Axios.request)
}
