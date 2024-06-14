import React, { useEffect } from "react";
import Link from "next/link";
import Header from "../components/Header";
import Page from "../components/Page";

export default function HomePage() {
  useEffect(() => {
    const title = "Hello!";
    const body = "This is a notification from your Electron app.";
    // window.ipc.send("show-notification", { title, body });
  }, []);

  function downloadCsvFile(data, filename) {
    const blob = new Blob([data], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    console.log(url, "url");
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  }
  return (
    <>
      <Page title="Home">
        <Header />
        <div className="grid grid-col-1 text-2xl w-full text-center">
          <div>
            {/* <Image
            priority={true}
            className="ml-auto mr-auto"
            src="/images/logo.png"
            alt="Logo image"
            width={256}
            height={256}
          /> */}
          </div>
          <span>⚡ Electron ⚡</span>
          <span>+</span>
          <span>Next.js</span>
          <span>+</span>
          <span>tailwindcss</span>
          <span>=</span>
          <span>💕 </span>
        </div>
        {/* <TextField id="outlined-basic" label="Outlined" variant="outlined" /> */}
        {/* <Button variant="contained">Default</Button> */}
        <div className="mt-1 w-full flex-wrap flex justify-center">
          <Link href="/addAccount">Add Account</Link>
        </div>
        <div className="mt-1 w-full flex-wrap flex justify-center">
          <Link href="/peopleProfiles">People Profiles</Link>
        </div>
        <div className="mt-1 w-full flex-wrap flex justify-center">
          <Link href="/companyProfiles">Company Profiles</Link>
        </div>
        <div className="mt-1 w-full flex-wrap flex justify-center">
          <Link href="/home">Home</Link>
        </div>
      </Page>
    </>
  );
}
