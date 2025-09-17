class Response {
  constructor(res, statusCode, data, metaData) {
    let status;
    if (String(statusCode).startsWith("5")) status = "error";
    else if (String(statusCode).startsWith("4")) status = "fail";
    else status = "success";

    const response = { status, data };
    if (metaData) response.metaData = metaData;

    res.status(statusCode).json(response);
  }
}
