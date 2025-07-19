import ClientContainer from "../components/ClientContainer";

export default function Home() {
  const layoutVersion = "Layout Version 2.0";
  
  return (
    <>
      <header>
        <h2>To-do List</h2>
        <ClientContainer layoutVersion={layoutVersion} />
      </header>
    </>
  );
}
