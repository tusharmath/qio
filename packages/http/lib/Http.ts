/* tslint:disable  no-unbound-method  */

import {QIO} from '@qio/core'
import Axios, {AxiosError, AxiosRequestConfig, AxiosResponse} from 'axios'

export const request = (config: AxiosRequestConfig) =>
  QIO.accessM((_: IAxiosEnv) => _.axios.request(config))

export interface IAxiosEnv {
  axios: {
    request(config: AxiosRequestConfig): QIO<AxiosResponse, AxiosError>
  }
}

export const axiosEnv = {
  axios: QIO.encaseP(Axios.request)
}
