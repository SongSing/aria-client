import useApi from "../hooks/useApi";

export default function Home() {
  const api = useApi();

  function refresh() {
    api.post('/refresh', {});
  }

  function createThumbnails() {
    api.post('/createThumbnails', {});
  }

  function createTransferFile() {
    api.post('/createTransferFile', {});
  }

  function readFromTransferFile() {
    api.post('/readFromTransferFile', {});
  }

  return (
    <div className="view home">
      <button onClick={refresh}>Refresh Library</button>
      <button onClick={createThumbnails}>Create Thumbnails</button>
      <button onClick={createTransferFile}>Create Transfer File</button>
      <button onClick={readFromTransferFile}>Read from Transfer File</button>
    </div>
  );
}