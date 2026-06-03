
function doGet(e) {
  return new BaseServer().handleGet(e);
}

function doPost(e) {
  return new BaseServer().handlePost(e);
}
