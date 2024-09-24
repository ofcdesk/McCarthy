export async function getServers(companyId: string) {
  const res = await fetch(
    process.env.NEXT_PUBLIC_API_URL_DOMAIN +
      "/api/store/get?key=servers_" +
      companyId +
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

export async function setServers(value: any, projectId: string) {
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
        key: "servers_" + projectId,
        value,
      }),
    }
  );
}
