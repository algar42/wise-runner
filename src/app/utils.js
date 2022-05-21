export const convertSeconds = (seconds) => {
  var convert = function (x) {
    return x < 10 ? "0" + x : x;
  };
  return (
    convert(parseInt(seconds / (60 * 60))) + ":" + convert(parseInt((seconds / 60) % 60)) + ":" + convert(seconds % 60)
  );
};

export const pathShorten = (str, maxLen, removeFilename) => {
  let splitter = "\\",
    tokens = str.split(splitter),
    maxLength = maxLen || 25,
    drive = str.indexOf(":") > -1 ? tokens[0] : "",
    fileName = removeFilename ? "" : tokens[tokens.length - 1],
    len = removeFilename ? drive.length : drive.length + fileName.length,
    remLen = maxLength - len - 5, // remove the current lenth and also space for 3 dots and 2 slashes
    path,
    lenA,
    lenB,
    pathA,
    pathB;

  if (tokens.join(splitter).length <= maxLen) return str;
  //remove first and last elements from the array
  tokens.splice(0, 1);

  //tokens.splice(tokens.length - 1, 1);

  //recreate our path
  path = tokens.join(splitter);
  //handle the case of an odd length
  lenA = Math.ceil(remLen / 2);
  lenB = Math.floor(remLen / 2);
  //rebuild the path from beginning and end
  pathA = path.substring(0, lenA);
  pathB = path.substring(path.length - (lenB - 5));
  path = drive + splitter + pathA + "..." + pathB + splitter;
  path = path + (removeFilename ? "" : fileName);
  console.log(tokens, maxLength, drive, fileName, len, remLen, pathA, pathB);
  return path;
};
