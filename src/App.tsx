import { useState, useEffect } from "react";
import { createPublicClient, http } from "viem";
import "./App.css";
import { polygon } from "viem/chains";

function App() {
  const [profileId, setProfileId] = useState<number>(0);
  const [nftData, setNftData] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);

  const publicClient = createPublicClient({
    chain: polygon,
    transport: http(),
  });

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const id = queryParams.get("profileId");
    if (id) {
      setProfileId(Number(id));
      fetchNFTData(Number(id));
    }
  }, []);

  // Fetch NFT data using the fetch API
  const fetchNFTData = async (tokenId: number) => {
    try {
      setLoading(true);
      const data = await publicClient.readContract({
        address: "0xDb46d1Dc155634FbC732f92E853b10B288AD5a1d",
        abi: [
          {
            inputs: [
              { internalType: "uint256", name: "tokenId", type: "uint256" },
            ],
            name: "tokenURI",
            outputs: [{ internalType: "string", name: "", type: "string" }],
            stateMutability: "view",
            type: "function",
          },
        ] as const,
        functionName: "tokenURI",
        args: [BigInt(tokenId)],
      });
      const imageBase64 = JSON.parse(atob(data.split(",")[1])).image;

      setNftData(imageBase64);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setNftData("");
      console.error("Error fetching NFT data:", error);
    }
  };

  const handleEnterProfileId = () => {
    if (profileId !== 0) {
      fetchNFTData(profileId);
    }
  };

  return (
    <>
      <h1>View Lens Profile NFT</h1>
      <div className="card">
        {profileId !== undefined && nftData !== undefined && !loading && (
          <img src={nftData} alt={`Profile ${profileId}`} />
        )}
        {loading && <div className="react-loading-spinner" />}

        <div>
          <input
            type="number"
            className="profile-input"
            placeholder="Enter Lens Profile ID"
            value={profileId !== 0 ? profileId : ""}
            onChange={(e) => {
              e.target.value === ""
                ? setProfileId(0)
                : setProfileId(Number(e.target.value));
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleEnterProfileId();
              }
            }}
          />
          <button onClick={() => handleEnterProfileId()}>Enter</button>
        </div>
      </div>
    </>
  );
}

export default App;
