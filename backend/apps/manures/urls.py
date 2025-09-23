from django.urls import path

from .views import ManuresViewset

urlpatterns = [
    path('manures/', ManuresViewset.as_view({'get': 'manures'}), name='manures'),
    path('manures/<int:pk>/', ManuresViewset.as_view({'get': 'manure'}), name='manure'),
    path('solidmaterialsconversionfactors/', ManuresViewset.as_view({'get': 'solidMaterialsConversionFactors'})),
    path('liquidmaterialsconversionfactors/', ManuresViewset.as_view({'get': 'liquidMaterialsConversionFactors'})),
    path('units/', ManuresViewset.as_view({'get': 'units'}), name='units'),
    path('units/<str:unit>/', ManuresViewset.as_view({'get': 'units'}), name='unit_detail'),
    path('nmineralizations/', ManuresViewset.as_view({'get': 'nMineralizations'}), name='n_mineralizations'),
    path('nmineralizations/<int:nMineralization>/<int:location>/',
         ManuresViewset.as_view({'get': 'nMineralizations'}),
         name='n_mineralization_detail'),
    path('ammoniaretentions/', ManuresViewset.as_view({'get': 'ammoniaRetentions'})),
    path('ammoniaretentions/<int:seasonApplication>/<int:dryMatter>/',
         ManuresViewset.as_view({'get': 'ammoniaRetentions'})),
    path('previousyearmanureapplications/', ManuresViewset.as_view({'get': 'previousYearManureApplications'})),
    path('liquidmaterialapplicationusgallonsperacrerateconversions/',
          ManuresViewset.as_view({'get': 'liquidMaterialApplicationUsGallonsPerAcreRateConversions'})),
    path('solidmaterialapplicationtonperacrerateconversions/',
          ManuresViewset.as_view({'get': 'solidMaterialApplicationTonPerAcreRateConversions'})),
]
