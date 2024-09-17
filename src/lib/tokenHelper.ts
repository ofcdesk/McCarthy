import { refresh } from "@procore/js-sdk";
import { oauthServerOptions } from "./procoreUtils";

type ProcoreToken = {
  id: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  created_at: number;
};

export async function getCompanies() {
  const res = await fetch(
    process.env.NEXT_PUBLIC_API_URL_DOMAIN +
      "/api/store/get?key=companies&application_token=" +
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

async function setCompanies(value: any) {
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
        key: "companies",
        value,
      }),
    }
  );
}

export async function setProcoreTokensFromCompanyBody(
  obj: {
    id: number;
    is_active: boolean;
    logo_url: string;
    my_company: boolean;
    name: string;
    pcn_business_experience: string | null;
  }[],
  token: ProcoreToken
) {
  const companies = (await getCompanies()) || [];

  const company = companies.find(
    (company: { id: number }) => company.id === obj[0].id
  );

  if (!company) {
    companies.push({
      id: obj[0].id,
      procoreToken: token,
    });
    setCompanies(companies);
    return companies;
  }

  company.procoreToken = token;

  setCompanies(companies);

  return companies;
}

export async function getProcoreTokenFromCompanyId(companyId: number) {
  const companies = (await getCompanies()) || [];
  const token = companies.find(
    (company: { id: number }) => company.id === companyId
  )?.procoreToken;

  if (
    !token ||
    Math.floor(Date.now() / 1000) - token.created_at >= token.expires_in - 60
  ) {
    const refreshed = await refresh(
      {
        refresh: token.refresh_token!,
        id: process.env.CLIENT_ID!,
        secret: process.env.CLIENT_SECRET!,
        uri: process.env.REDIRECT_URI!,
        token: token.access_token,
      },
      oauthServerOptions
    ).then((response) => {
      token.access_token = response.accessToken;
      token.refresh_token = response.refreshToken;
      token.expires_in = response.expiresIn;
      token.created_at = Math.floor(Date.now() / 1000);

      const newCompanies = companies.map(
        (company: { id: number; procoreToken: any }) => {
          if (company.id === companyId) {
            company.procoreToken = token;
          }
          return company;
        }
      );

      setCompanies(newCompanies);

      return response as unknown as {
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
        token_type: string;
        created_at: number;
        scope: string;
      };
    });

    return refreshed;
  }

  return token;
}

export async function getACCTokenFromCompanyId(companyId: number) {
  const companies = (await getCompanies()) || [];

  const token = companies.find(
    (company: { id: number }) => company.id === companyId
  )?.accToken;

  if (!token || Math.floor(Date.now() / 1000) - token.iat >= token.ex - 60) {
    const refreshed = await fetch(
      process.env.NEXT_PUBLIC_API_URL_DOMAIN +
        "/api/acc/auth/refreshtoken?application_token=" +
        process.env.SIHUB_APPLICATION_TOKEN +
        "&access_token=" +
        token.tk +
        "&refresh_token=" +
        token.rt,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => {
        if (!response.ok) {
          console.log("RESPONSE FROM REFRESH ERROR", response);
          throw new Error("Failed to refresh token");
        }

        return response.json();
      })
      .then((data) => {
        token.tk = data.access_token;
        token.ex = data.expires_in;
        token.rt = data.refresh_token;
        token.iat = Math.floor(Date.now() / 1000);

        const newCompanies = companies.map(
          (company: { id: number; accToken: any }) => {
            if (company.id === companyId) {
              console.log("SETTING NEW TOKEN");
              company.accToken = token;
            }
            return company;
          }
        );

        setCompanies(newCompanies);
      })
      .catch((error) => {
        console.log({ error: error.message });
      });

    return refreshed;
  }

  return token;
}

export async function setACCTokenFromCallbackQuery(
  query: {
    tk: string;
    ex: string;
    rt: string;
  },
  companyId: number
) {
  const companies = (await getCompanies()) || [];
  const company = companies.find(
    (company: { id: number }) => company.id === companyId
  );

  if (!company) {
    companies.push({
      id: companyId,
      accToken: {
        ...query,
        iat: Math.floor(Date.now() / 1000),
      },
    });

    return companies;
  }

  company.accToken = query;

  setCompanies(companies);

  return companies;
}
