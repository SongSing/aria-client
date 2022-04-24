import useApi from "../hooks/useApi";

export default function Home() {
  const api = useApi();

  function refresh() {
    api.post('/refresh', {});
  }

  function createThumbnails() {
    api.post('/createThumbnails', {});
  }

  return (
    <div className="view home">
      <button onClick={refresh}>Refresh Library</button>
      <button onClick={createThumbnails}>Create Thumbnails</button>
    </div>
  );
}