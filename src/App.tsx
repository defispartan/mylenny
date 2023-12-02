import { useState, useEffect } from "react";
import "./App.css";
import { fetchHandle, fetchNFTData, fetchProfileId } from "./data/lookup";

function App() {
  const [profileId, setProfileId] = useState<number>(0);
  const [handle, setHandle] = useState<string | undefined>(undefined);
  const [nftData, setNftData] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const nftDataQuery = async () => {
      const queryParams = new URLSearchParams(window.location.search);
      const id = queryParams.get("profileId");
      if (id) {
        try {
          setLoading(true);
          setProfileId(Number(id));
          const nftData = await fetchNFTData(Number(id));
          setNftData(nftData);
          setLoading(false);
        } catch (e) {
          setLoading(false);
          setHandle(undefined);
          setNftData("");
        }
      }
    };
    nftDataQuery();
  }, []);

  const handleEnterProfileId = async () => {
    if (profileId !== 0) {
      try {
        setLoading(true);
        const handle = await fetchHandle(profileId);
        const nftData = await fetchNFTData(profileId);
        setNftData(nftData);
        setHandle(handle);
        setLoading(false);
      } catch (e) {
        setLoading(false);
        setHandle(undefined);
        setNftData("");
      }
    }
  };

  const handleEnterHandle = async () => {
    if (handle) {
      try {
        setLoading(true);
        const profileId = await fetchProfileId(handle);
        if (profileId) {
          setProfileId(Number(profileId));
          const nftData = await fetchNFTData(Number(profileId));
          setNftData(nftData);
        }
        setLoading(false);
      } catch (e) {
        setLoading(false);
        setProfileId(0);
        setNftData("");
      }
    }
  };

  const setNewProfileId = (id: number) => {
    setProfileId(id);
    const queryParams = new URLSearchParams(window.location.search);
    queryParams.set("profileId", id.toString());
  };

  return (
    <>
      <h1>View Lens Profile NFT</h1>
      <div className="card">
        {profileId !== 0 && nftData !== "" && !loading && (
          <img src={nftData} alt={`Profile ${profileId}`} />
        )}
        {loading && <div className="react-loading-spinner" />}

        <div className="input-stack">
          <div>
            <input
              type="number"
              className="profile-input"
              placeholder="Enter Lens Profile ID"
              value={profileId !== 0 ? profileId : ""}
              onChange={(e) => {
                e.target.value === ""
                  ? setProfileId(0)
                  : setNewProfileId(Number(e.target.value));
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleEnterProfileId();
                }
              }}
            />
            <button onClick={() => handleEnterProfileId()}>Enter</button>
          </div>
          <p>or</p>
          <div>
            <input
              type="text"
              className="profile-input"
              placeholder="Enter handle (without .lens)"
              value={handle ? handle : ""}
              onChange={(e) => {
                setHandle(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleEnterHandle();
                }
              }}
            />
            <button onClick={() => handleEnterHandle()}>Enter</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
