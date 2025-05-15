import { ImageResponse } from "@vercel/og";

export const runtime = "edge";

const baseUrl = process.env.PERSONAL_URL
  ? `https://${process.env.PERSONAL_URL}`
  : "http://localhost:3001"; // Default to localhost if running locally

async function loadGoogleFont(font: string, text: string) {
  const url = `https://fonts.googleapis.com/css2?family=${font}&text=${encodeURIComponent(
    text
  )}`;
  const css = await (await fetch(url)).text();
  const resource = css.match(
    /src: url\((.+)\) format\('(opentype|truetype)'\)/
  );

  if (resource) {
    const response = await fetch(resource[1]);
    if (response.status == 200) {
      return await response.arrayBuffer();
    }
  }

  throw new Error("failed to load font data");
}

export async function GET(request: Request) {
  // console.log(request.url);
  const { searchParams } = new URL(request.url);
  console.log("@@searchParams", searchParams);

  const engineCode = searchParams.get("engineCode");
  const displacement = searchParams.get("displacement");
  const power = searchParams.get("power");
  const torque = searchParams.get("torque");
  const years = searchParams.get("years");
  const description = searchParams.get("description");
  const trimmedDescription = description
    ? description.length > 200
      ? `${description.slice(0, 280)}...`
      : description
    : "";
  // if (!engineCode) {
  //   return new Response("Missing engine code", { status: 400 });
  // }

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          backgroundColor: "#1e293b",
        }}
        tw="relative"
      >
        <div tw="flex w-full h-full absolute top-0 left-0 ">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${baseUrl}/ob_background.jpg`}
            width="1000"
            height="500"
            alt="balls"
            tw="w-full h-full"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>
        <div tw="flex flex-col w-full h-full p-20 overflow-hidden">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 32,
              }}
            >
              Know your engine
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "20px",
                  padding: "16px",
                }}
              >
                <svg
                  fill="white"
                  viewBox="0 0 32 32"
                  style={{ transform: "scale(2)" }}
                >
                  <path
                    d="M20.8701 15.667H20.4844C20.4009 15.0816 20.1676 14.5439 19.8248 14.0938L20.1031 13.8155C20.2862 13.6325 20.2862 13.3357 20.1031 13.1526C19.92 12.9696 19.6233 12.9696 19.4402 13.1526L19.1601 13.4328C18.7097 13.0937 18.1727 12.8639 17.5888 12.783V12.3857C17.5888 12.1269 17.3789 11.917 17.12 11.917C16.8612 11.917 16.6513 12.1269 16.6513 12.3857V12.783C16.0673 12.8639 15.5303 13.0937 15.08 13.4328L14.7998 13.1526C14.6168 12.9696 14.3201 12.9696 14.1369 13.1526C13.9538 13.3357 13.9538 13.6325 14.1369 13.8155L14.4152 14.0938C14.0724 14.5438 13.8392 15.0816 13.7557 15.667H13.37C13.1111 15.667 12.9012 15.8769 12.9012 16.1357C12.9012 16.3946 13.1111 16.6045 13.37 16.6045H13.7519C13.8311 17.1936 14.0619 17.7354 14.4036 18.1892L14.1368 18.4559C13.9538 18.639 13.9538 18.9358 14.1368 19.1188C14.2284 19.2104 14.3483 19.2561 14.4683 19.2561C14.5882 19.2561 14.7082 19.2103 14.7997 19.1188L15.0646 18.854C15.5181 19.1994 16.0606 19.4335 16.6512 19.5154V19.8857C16.6512 20.1446 16.8611 20.3544 17.1199 20.3544C17.3788 20.3544 17.5887 20.1446 17.5887 19.8857V19.5154C18.1792 19.4335 18.7218 19.1994 19.1752 18.854L19.4401 19.1188C19.5316 19.2104 19.6516 19.2561 19.7715 19.2561C19.8915 19.2561 20.0114 19.2103 20.103 19.1188C20.286 18.9358 20.286 18.639 20.103 18.4559L19.8363 18.1892C20.1779 17.7354 20.4087 17.1936 20.4879 16.6045H20.8699C21.1287 16.6045 21.3386 16.3946 21.3386 16.1357C21.3386 15.8769 21.1289 15.667 20.8701 15.667ZM17.1201 18.6101C15.7631 18.6101 14.6591 17.5061 14.6591 16.1491C14.6591 14.7922 15.7631 13.6882 17.1201 13.6882C18.477 13.6882 19.581 14.7922 19.581 16.1491C19.581 17.5061 18.477 18.6101 17.1201 18.6101Z"
                    fill="white"
                  />
                  <path
                    d="M24 3.88919C24 2.28747 22.6969 0.984391 21.0952 0.984391H5.3557C5.35073 0.984391 5.34581 0.984344 5.34084 0.984344C3.91425 0.984344 2.57306 1.53991 1.56436 2.54866C0.555563 3.55741 0 4.89864 0 6.32524C0 7.75047 0.554484 9.09044 1.56141 10.0989C1.56141 10.0989 12.2238 20.9691 12.2552 21.0006C13.5547 22.3 15.2824 23.0156 17.1201 23.0156C18.9578 23.0156 20.6855 22.3 21.9849 21.0006C23.3115 19.6739 23.982 17.9358 23.9965 16.1932C23.9988 16.1744 24 16.1553 24 16.1358V3.98664C24 3.97736 23.9997 3.96813 23.9992 3.95894C23.9997 3.93574 24 3.91249 24 3.88919ZM23.0625 3.88919C23.0625 4.97397 22.18 5.85649 21.0952 5.85649C20.0104 5.85649 19.1279 4.97397 19.1279 3.88919C19.1279 2.80441 20.0104 1.92189 21.0952 1.92189C22.18 1.92189 23.0625 2.80441 23.0625 3.88919ZM2.22727 3.21156C3.05822 2.38061 4.16287 1.92264 5.33794 1.92189C5.33892 1.92189 5.33986 1.92194 5.34084 1.92194H5.35603C6.52655 1.92588 7.62637 2.38352 8.45447 3.21161C9.28617 4.04327 9.74419 5.14905 9.74419 6.32524C9.74419 7.50142 9.28617 8.6072 8.45447 9.43886C7.62281 10.2706 6.51703 10.7286 5.34084 10.7286C4.1647 10.7286 3.05892 10.2706 2.22727 9.43886C1.39552 8.60716 0.9375 7.50142 0.9375 6.32524C0.9375 5.14905 1.39552 4.04327 2.22727 3.21156ZM4.3163 11.5685C4.65038 11.633 4.99308 11.6661 5.34084 11.6661C6.76744 11.6661 8.10862 11.1105 9.11737 10.1018C10.1261 9.09302 10.6817 7.75178 10.6817 6.32524C10.6817 4.89864 10.1261 3.55745 9.11737 2.5487C8.8837 2.31503 8.63217 2.10569 8.36592 1.92194H18.9598C18.4824 2.43977 18.1904 3.13103 18.1904 3.88924C18.1904 5.49095 19.4935 6.79403 21.0952 6.79403C21.8534 6.79403 22.5447 6.50205 23.0625 6.02463V12.6671C22.7714 12.1681 22.4122 11.6982 21.9849 11.2709C19.3025 8.5885 14.9378 8.58845 12.2553 11.2709C10.4822 13.044 9.88116 15.5521 10.452 17.8235L4.3163 11.5685ZM21.322 20.3376C20.1996 21.46 18.7073 22.0781 17.1201 22.0781C15.4946 22.0793 13.9623 21.4258 12.8361 20.2539C11.7657 19.1416 11.1777 17.6838 11.1777 16.1358C11.1777 14.5485 11.7959 13.0562 12.9182 11.9338C14.0406 10.8115 15.5328 10.1934 17.1202 10.1934C18.7074 10.1934 20.1997 10.8115 21.322 11.9338C23.6389 14.2508 23.6389 18.0207 21.322 20.3376Z"
                    fill="white"
                  />
                  <path
                    d="M20.3921 3.88919C20.3921 4.2775 20.7071 4.59232 21.0954 4.59232C21.4837 4.59232 21.7985 4.2775 21.7985 3.88919C21.7985 3.50088 21.4837 3.18607 21.0954 3.18607H21.095C20.7067 3.18607 20.3921 3.50088 20.3921 3.88919Z"
                    fill="white"
                  />
                  <path
                    d="M3.71878 7.9473C4.16602 8.39454 4.75341 8.61813 5.34084 8.61813C5.92828 8.61813 6.51567 8.39449 6.96291 7.9473C7.3965 7.51371 7.63528 6.93761 7.63528 6.32524C7.63528 5.71282 7.3965 5.13672 6.96291 4.70313C6.06848 3.80875 4.61316 3.80875 3.71873 4.70313C2.82436 5.59755 2.82436 7.05288 3.71878 7.9473ZM4.38169 5.36608C4.91053 4.83719 5.77111 4.83719 6.3 5.36608C6.55655 5.62263 6.69778 5.96322 6.69778 6.32524C6.69778 6.68726 6.5565 7.02785 6.29995 7.2844C6.04341 7.54094 5.70281 7.68218 5.34084 7.68218C4.97883 7.68218 4.63819 7.5409 4.38164 7.28435C3.8528 6.7555 3.8528 5.89497 4.38169 5.36608Z"
                    fill="white"
                  />
                  <path
                    d="M17.1201 14.7429C16.3446 14.7429 15.7138 15.3738 15.7138 16.1492C15.7138 16.9246 16.3446 17.5554 17.1201 17.5554C17.8955 17.5554 18.5263 16.9246 18.5263 16.1492C18.5263 15.3738 17.8955 14.7429 17.1201 14.7429ZM17.1201 16.6179C16.8616 16.6179 16.6513 16.4076 16.6513 16.1492C16.6513 15.8907 16.8616 15.6804 17.1201 15.6804C17.3785 15.6804 17.5888 15.8907 17.5888 16.1492C17.5888 16.4076 17.3785 16.6179 17.1201 16.6179Z"
                    fill="white"
                  />
                </svg>
                <div
                  style={{
                    fontSize: 60,
                    fontWeight: 700,
                    color: "white",
                    marginBottom: "20px",
                    textAlign: "center",
                    display: "flex",
                  }}
                >
                  BMW {engineCode}
                </div>
              </div>
            </div>
          </div>
          {/* <span>{engineCode}</span>
        <span>{displacement}</span>
        <span>{power}</span>
        <span>{torque}</span>
        <span>{years}</span>
        <span>{isDerived}</span> */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              fontSize: 30,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                letterSpacing: "-0.02em",
                color: "white",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "10px",
                  justifyItems: "center",
                  alignItems: "center",
                }}
              >
                <span>{power}</span>
              </div>
              <span
                style={{
                  overflow: "hidden",
                }}
              >
                {trimmedDescription}
              </span>
              <span style={{ fontSize: 30, color: "#64748b" }}>
                https://know-your-bimmer.jineshb.app
              </span>

              {/* <span>Power:</span>
            <span>{power}</span>
            <span>Torque:</span>
            <span>{torque}</span>
            <span>Years:</span>
            <span>{years}</span> */}
            </div>
          </div>
          {/* {isDerived && (
          <div
            style={{
              marginTop: "20px",
              fontSize: 24,
              color: "#64748b",
              padding: "10px 20px",
              border: "2px solid #64748b",
              borderRadius: "8px",
              display: "flex",
            }}
          >
            Derived Engine
          </div>
        )} */}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Geist",
          data: await loadGoogleFont("Geist:wght@800", engineCode || ""),
          style: "normal",
        },
        {
          name: "Inter",
          data: await loadGoogleFont(
            "Inter:wght@400",
            displacement ||
              "" + power ||
              "" + torque ||
              "" + years ||
              "" + description ||
              ""
          ),
          style: "normal",
        },
      ],
    }
  );
}
