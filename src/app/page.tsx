import ImageGallery from "@/components/ImageGallery";
import ChairPersons from "@/components/ChairPersons";
import { getGalleryImages } from "@/lib/services/gallery.service";
import { getChairPersons } from "@/lib/services/chairpersons.service";

export default async function Page() {
  const [images, chairPersons] = await Promise.all([
    getGalleryImages(),
    getChairPersons(),
  ]);

  return (
    <main style={{ backgroundColor: "#000000", minHeight: "100vh" }}>
      <ImageGallery
        images={images}
        title="MoraXtreme 11.0 Highlights"
        subtitle="A glimpse into the ideas, energy, and innovation that define the MoraXtreme experience."
        columns={3}
      />
    </main>
  );
}
