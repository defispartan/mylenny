import { useState, useEffect } from "react";
import { createPublicClient, http } from "viem";
import "./App.css";
import { polygon } from "viem/chains";

const handleRegistryAddress = "0xD4F2F33680FCCb36748FA9831851643781608844";
const lensHandleAddress = "0xe7E7EaD361f3AaCD73A61A9bD6C10cA17F38E945";

const handleRegistryAbi = [
  {
    inputs: [{ internalType: "uint256", name: "profileId", type: "uint256" }],
    name: "getDefaultHandle",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "handleId", type: "uint256" }],
    name: "resolve",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

const lensHandleAbi = [
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "getLocalName",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "localName", type: "string" }],
    name: "getTokenId",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "pure",
    type: "function",
  },
] as const;

function App() {
  const [profileId, setProfileId] = useState<number>(0);
  const [handle, setHandle] = useState<string | undefined>(undefined);
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

  const handleEnterProfileId = async () => {
    if (profileId !== 0) {
      const handle = await fetchHandle();
      await fetchNFTData(profileId);
      setHandle(handle);
    }
  };

  const fetchHandle = async () => {
    const handleId = await publicClient.readContract({
      address: handleRegistryAddress,
      abi: handleRegistryAbi,
      functionName: "getDefaultHandle",
      args: [BigInt(profileId)],
    });
    const localName = await publicClient.readContract({
      address: lensHandleAddress,
      abi: lensHandleAbi,
      functionName: "getLocalName",
      args: [BigInt(handleId)],
    });
    return localName;
  };

  const fetchProfileId = async () => {
    if (handle) {
      const handleId = await publicClient.readContract({
        address: lensHandleAddress,
        abi: lensHandleAbi,
        functionName: "getTokenId",
        args: [handle],
      });
      const profileId = await publicClient.readContract({
        address: handleRegistryAddress,
        abi: handleRegistryAbi,
        functionName: "resolve",
        args: [BigInt(handleId)],
      });
      return profileId;
    }
  };

  const handleEnterHandle = async () => {
    setLoading(true);
    const profileId = await fetchProfileId();
    if (profileId) {
      setProfileId(Number(profileId));
      fetchNFTData(Number(profileId));
    }
    setLoading(false);
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
        {profileId !== undefined && nftData !== undefined && !loading && (
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
