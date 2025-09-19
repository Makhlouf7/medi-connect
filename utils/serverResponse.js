class ServerResponse {
  constructor(res, statusCode, data = null, metaData = null) {
    let status;
    if (String(statusCode).startsWith("5")) status = "error";
    else if (String(statusCode).startsWith("4")) status = "fail";
    else status = "success";

    const response = { status, data };
    if (metaData) response.metaData = metaData;

    data ? res.status(statusCode).json(response) : res.status(statusCode).end();
  }
}

module.exports = ServerResponse;
