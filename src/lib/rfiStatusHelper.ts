export async function getRFIStatusACCRFI(objectId: string): Promise<string> {
  const res = await fetch(
    process.env.NEXT_PUBLIC_API_URL_DOMAIN +
      "/api/store/get?key=rfiStatus_" +
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
    return body.length > 0 ? body : "draft";
  } catch (e) {
    return "draft";
  }
}

export async function setRFIStatusACCRFI(value: string, objectId: string) {
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
        key: "rfiStatus_" + objectId,
        value,
      }),
    }
  );
}
