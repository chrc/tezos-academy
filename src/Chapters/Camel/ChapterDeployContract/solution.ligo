ligo compile-storage starmap3.mligo main '{name="Sol";system_planets=Map.literal [("earth", {x=2;y=7;z=1})]}'

ligo dry-run starmap2.mligo main 'AddPlanet (("mars", {x=4;y=15;z=2}))' '{name="Sol";system_planets=Map.literal [("earth", {x=2;y=7;z=1})]}'