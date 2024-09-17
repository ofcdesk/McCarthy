export async function getAccProjectFromProcore(objectId: string) {
  //console.log("Getting " + "accProjectFromProcore_" + objectId);

  const res = await fetch(
    process.env.NEXT_PUBLIC_API_URL_DOMAIN +
      "/api/store/get?key=accProjectFromProcore_" +
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

export async function setAccProjectFromProcores(value: any, objectId: string) {
  //console.log("Setting " + "accProjectFromProcore_" + objectId + " to " + value);
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
        key: "accProjectFromProcore_" + objectId,
        value,
      }),
    }
  );
}
