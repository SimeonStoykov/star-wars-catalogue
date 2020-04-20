export function getDataFromResp({ response, singleRecord = true }) {
  if (!response) return;
  if (singleRecord) return response && response.data && response.data[0];
  return response && response.data;
}
