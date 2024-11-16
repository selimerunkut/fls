import type { NextPage } from "next";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";
import UpdatePythPrice from "~~/components/UpdatePythPrice";

export const metadata = getMetadata({
    title: "Backoffice",
    description: "Backoffice",
});

const Backoffice: NextPage = () => {
    return (
        <>
            <div className="text-center mt-8 bg-secondary p-10">
                <h1 className="text-4xl my-0">Backoffice</h1>
            </div>
            <UpdatePythPrice/>
        </>
    );
};

export default Backoffice;
