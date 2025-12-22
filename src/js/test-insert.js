import { supabase } from "./core/supabaseClient.js";
import { postAdminGroups } from "./modules/groups/groups.api.js";

const { data: { session } } = await supabase.auth.getSession();
console.log("Session:", session);

if (!window.__EJENEX_INSERT_TEST_RAN__) {
    window.__EJENEX_INSERT_TEST_RAN__ = true;

    (async () => {
        if (!session) {
            console.error("No hay sesión. Inicia sesión primero.");
            return;
        }
        try {
            const res = await postAdminGroups({
                name: "Grupo Test Supabase",
                short_description: "Prueba de inserción"
            });
            console.log("Insert OK:", res);
        } catch (e) {
            console.error("Insert error:", e.message);
        }
    })();
}
