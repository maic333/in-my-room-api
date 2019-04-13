import { apiRegistryService } from '../services/api-registry.service';
import { ApiHttpMethod } from '../types/api-http-method';
import RouteConfig from '../types/route-config';

export default function ApiRoute(
  route: string,
  method: ApiHttpMethod = ApiHttpMethod.GET,
  config: RouteConfig = {}
) {
  return function (target: any, key: string, descriptor: PropertyDescriptor) {
    // register API route
    apiRegistryService.registerRoute(route, method, config, descriptor.value);
  };
}
