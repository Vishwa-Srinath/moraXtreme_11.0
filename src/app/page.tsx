import ImageGallery from "@/components/ImageGallery";
import TeamSlider from "@/components/TeamSlider";
import { getGalleryImages } from "@/lib/services/gallery.service";
import { getTeamMembers } from "@/lib/services/team.service";

export default async function Page() {
  const [images, teamMembers] = await Promise.all([
    getGalleryImages(),
    getTeamMembers(),
  ]);

  return (
    <main style={{ backgroundColor: "#000000", minHeight: "100vh" }}>
      <ImageGallery
        images={images}
        title="MoraXtreme 11.0 Highlights"
        subtitle="A glimpse into the ideas, energy, and innovation that define the MoraXtreme experience."
        columns={3}
      />
      <TeamSlider
        members={teamMembers}
        title="Meet the Team"
        subtitle="The people behind MoraXtreme 11.0 & IEEEXtreme 19.0."
        eyebrow="Leadership"
        autoInterval={4500}
      />
    </main>
  );
}
