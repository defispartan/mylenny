import { createPublicClient, http } from "viem";
import { polygon } from "viem/chains";


const publicClient = createPublicClient({
    chain: polygon,
    transport: http(),
});

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

export const fetchHandle = async (profileId: number): Promise<string> => {
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

export const fetchNFTData = async (tokenId: number): Promise<string> => {
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
        return imageBase64;
    } catch (error) {
        console.error("Error fetching NFT data:", error);
        return "";
    }
};

export const fetchProfileId = async (handle: string): Promise<number> => {
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
    return Number(profileId);
};