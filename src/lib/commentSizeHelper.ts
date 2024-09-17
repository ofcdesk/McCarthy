export async function getCommentsSizeACC(objectId: string): Promise<number> {
  const res = await fetch(
    process.env.NEXT_PUBLIC_API_URL_DOMAIN +
      "/api/store/get?key=commentSize_" +
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
    return (body as unknown as number) ?? 0;
  } catch (e) {
    return 0;
  }
}

export async function setCommentsACC(value: number, objectId: string) {
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
        key: "commentSize_" + objectId,
        value,
      }),
    }
  );
}
