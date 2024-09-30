import React from "react";

const OpenGraphTags = () => {
  return (
    <React.Fragment>
      <meta property="og:url" content="https://www.mccarthy.com/" />
      {/* thumbnail And title for social media */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content="McCarthy Dashboard" />
      <meta property="og:description" content="McCarthy Dashboard." />
      <meta property="og:image" content="/assets/images/landing/preview.png" />
    </React.Fragment>
  );
};

export default OpenGraphTags;
