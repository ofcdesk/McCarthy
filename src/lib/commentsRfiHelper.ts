export async function getRFICommentLinks(objectId: string) {
  //console.log("Getting " + "rficommentlink_" + objectId);

  const res = await fetch(
    process.env.NEXT_PUBLIC_API_URL_DOMAIN +
      "/api/store/get?key=rficommentlink_" +
      objectId +
      "&application_token=" +
      process.env.SIHUB_APPLICATION_TOKEN,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const body = await res.text();

  try {
    return body ? JSON.parse(body) : [];
  } catch (e) {
    return [];
  }
}

export async function setRFICommentLinks(value: any, objectId: string) {
  //console.log("Setting " + "rficommentlink_" + objectId + " to " + value);
  return await fetch(
    process.env.NEXT_PUBLIC_API_URL_DOMAIN +
      "/api/store/set?application_token=" +
      process.env.SIHUB_APPLICATION_TOKEN,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        key: "rficommentlink_" + objectId,
        value,
      }),
    }
  );
}
