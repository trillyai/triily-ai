export function hello( req, res ) {
  res.status(200).send({
    data: "Hello World!",
  });
}
