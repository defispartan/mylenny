import { useState, useEffect } from "react";
import { createPublicClient, http } from "viem";
import "./App.css";
import { polygon } from "viem/chains";

function App() {
  const [profileId, setProfileId] = useState<number | undefined>(undefined);
  const [nftData, setNftData] = useState<string>("");

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
    } catch (error) {
      console.error("Error fetching NFT data:", error);
    }
  };

  const handleEnterProfileId = () => {
    if (profileId) {
      fetchNFTData(profileId);
    }
  };

  return (
    <>
      <header>
        <h1>View Lens Profile Image</h1>
      </header>
      <body>
        <div className="card">
          {Boolean(profileId) && Boolean(nftData) && (
            <img src={nftData} alt={`Profile ${profileId}`} />
          )}

          <div>
            <input
              type="text"
              className="profile-input"
              placeholder="Enter Lens Profile ID"
              value={profileId}
              onChange={(e) => {
                if (e.target.value) setProfileId(Number(e.target.value));
              }}
            />
            <button onClick={() => handleEnterProfileId()}>Enter</button>
          </div>
        </div>
      </body>
    </>
  );
}

export default App;
