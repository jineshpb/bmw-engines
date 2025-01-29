import Image from "next/image";
import React from "react";

const Header = () => {
  return (
    <div className="flex flex-row items-center mt-10 gap-2">
      <div className="flex flex-row items-center justify-center">
        <Image src={`/beemer_logo.png`} alt="BMW logo" width={80} height={80} />
      </div>
      <div className="flex flex-col">
        <h1 className="text-4xl font-bold">BMW catalog</h1>
        <h2 className="text-xl font-normal text-gray-400">Know your Bimmer</h2>
      </div>
    </div>
  );
};

export default Header;
