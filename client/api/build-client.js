import axios from 'axios';

export default ({ req }) => {
  if (typeof window === 'undefined') {
    //We are on the server, we need to make the request to the backend using the ingress-nginx-controller service name
    return axios.create({
      baseURL:
        'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
      headers: req.headers,
    });
  } else {
    //We are on the client, we can make the request to the backend using a relative URL
    return axios.create({
      baseURL: '/',
    });
  }
};
