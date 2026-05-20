async function test() {
  const url1 = "https://admin.wenow.netme.now/store/orders?fields=*fulfillments.tracking_links";
  const res1 = await fetch(url1, {
    headers: {
      "x-publishable-api-key": "pk_cc5b2ba1531c2322b06dcdebd1c1e8944d9e86ea5abc6c1382ecd7c13cf5340a"
    }
  });
  console.log("Status for tracking_links:", res1.status);
  const text1 = await res1.text();
  console.log("Response for tracking_links:", text1.substring(0, 300));

  const url2 = "https://admin.wenow.netme.now/store/orders?fields=*fulfillments";
  const res2 = await fetch(url2, {
    headers: {
      "x-publishable-api-key": "pk_cc5b2ba1531c2322b06dcdebd1c1e8944d9e86ea5abc6c1382ecd7c13cf5340a"
    }
  });
  console.log("Status for fulfillments:", res2.status);
  const text2 = await res2.text();
  console.log("Response for fulfillments:", text2.substring(0, 300));
}
test();
