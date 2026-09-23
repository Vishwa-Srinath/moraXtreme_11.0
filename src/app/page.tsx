import ImageGallery from "@/components/ImageGallery";
import TeamSlider from "@/components/TeamSlider";
import { GALLERY_PLACEHOLDER_IMAGES } from "@/data/gallery.placeholder";
import { TEAM_PLACEHOLDER } from "@/data/team.placeholder";

export default function Page() {
  return (
    <main style={{ backgroundColor: "#000000", minHeight: "100vh" }}>
      <ImageGallery
        images={GALLERY_PLACEHOLDER_IMAGES}
        title="MoraXtreme 10.0 Highlights"
        subtitle="A glimpse into the ideas, energy, and innovation that define the MoraXtreme experience."
        columns={3}
      />
      <TeamSlider
        members={TEAM_PLACEHOLDER}
        title="Meet the Team"
        subtitle="The people behind MoraXtreme 11.0"
        eyebrow="Leadership"
        autoInterval={4500}
      />
    </main>
  );
}
