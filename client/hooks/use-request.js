import axios from 'axios';
import { useState } from 'react';

export default ({ url, method, body, onSuccess }) => {
  const [errors, setErrors] = useState(null);
  const doRequest = async (props = {}) => {
    try {
      setErrors(null);
      const response = await axios[method](url, { ...body, ...props });
      if (onSuccess) {
        onSuccess(response.data);
      }
      return response.data;
    } catch (err) {
      // A 4xx/5xx from our services always carries { errors: [{ message }] }.
      // A network-level failure (offline, aborted request, a browser extension
      // hooking XMLHttpRequest) rejects with no `response` at all, so fall back
      // to the raw message instead of crashing on undefined.
      const serverErrors = err.response?.data?.errors;
      const errorList = Array.isArray(serverErrors)
        ? serverErrors
        : [{ message: err.message || 'Something went wrong. Please try again.' }];

      setErrors(
        <div className="alert alert-danger">
          <h4>Ooops....</h4>
          <ul className="my-0">
            {errorList.map((err, i) => (
              <li key={err.message || i}>{err.message}</li>
            ))}
          </ul>
        </div>,
      );
    }
  };
  return { doRequest, errors };
};
