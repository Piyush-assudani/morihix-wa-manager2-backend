/**
 * Server-local Sheet and File Storage Service
 * Stores contact sheets and files directly on the local server disk.
 */
const { uploadBufferToServer, uploadFileToServer, deleteFileFromServer } = require("./localStorageService");

const uploadExcelToSupabase = async (buffer, filename, folder = "sheets") => {
  return await uploadBufferToServer(buffer, folder, "raw");
};

module.exports = {
  uploadExcelToSupabase,
  uploadBufferToServer,
  uploadFileToServer,
  deleteFileFromServer,
};
