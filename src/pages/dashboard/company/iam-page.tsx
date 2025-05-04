import IamAppBar from "@/components/feature-specific/iam/iam-app-bar";
import IamBody from "@/components/feature-specific/iam/iam-body";


export default function() {
    return <div className="p-4">
        <IamAppBar />
        <IamBody />
    </div>
}