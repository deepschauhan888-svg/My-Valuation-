import { createClient } from "@/lib/supabase/server";
import { getCities } from "@/lib/supabase/queries";
import CityManager from "@/components/admin/CityManager";
import AddCityForm from "@/components/admin/AddCityForm";

export default async function CitiesPage() {
  const supabase = createClient();
  const cities = await getCities(supabase);

  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      <div className="mb-10">
        <div className="eyebrow mb-3">City Management</div>
        <h1 className="font-display font-bold text-3xl tracking-tight">Cities</h1>
        <p className="text-navy-400 mt-2 measure">
          Every city has its own independent set of rule categories. Deactivating a city hides it from the
          public valuation tool without deleting its configured rules.
        </p>
      </div>

      <div className="mb-8">
        <AddCityForm />
      </div>

      {cities.length === 0 ? (
        <p className="text-sm text-navy-400">No cities yet — add the first one above.</p>
      ) : (
        <CityManager cities={cities} />
      )}
    </div>
  );
}
