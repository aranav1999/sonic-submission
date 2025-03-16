import CreateNFTForm from "./CreateNFTForm";

// This is a server component by default, but it simply renders our client form.
export default function CreateNFTPage() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Create NFT via Metaplex</h1>
      <CreateNFTForm />
    </div>
  );
}
