// Data not seeded into DB.
// From bcgov/agri-nmp, agri-nmp/app/Agri.Data/SeedData/StaticDataVersion_13.json
// Manually changed ManureType to be 1 for Liquid, 2 for Solid, and 3 for either
const SEASON_APPLICATION = [
  {
    Id: 1,
    Name: 'Spring - Incorporated within 1 hour',
    Season: 'Spring',
    ApplicationMethod: 'Incorporated within 1 hour',
    DryMatterLessThan1Percent: 0.95,
    DryMatter1To5Percent: 0.95,
    DryMatter5To10Percent: 0.95,
    DryMatterGreaterThan10Percent: 0.95,
    PoultrySolid: '0.95',
    Compost: 'Spring',
    SortNum: 110,
    ManureType: 3,
    StaticDataVersionId: 13,
  },
  {
    Id: 2,
    Name: 'Spring - Incorporated 1 day after',
    Season: 'Spring',
    ApplicationMethod: 'Incorporated 1 day after',
    DryMatterLessThan1Percent: 0.95,
    DryMatter1To5Percent: 0.7,
    DryMatter5To10Percent: 0.6,
    DryMatterGreaterThan10Percent: 0.5,
    PoultrySolid: '0.7',
    Compost: 'Spring',
    SortNum: 120,
    ManureType: 3,
    StaticDataVersionId: 13,
  },
  {
    Id: 3,
    Name: 'Spring - Incorporated 2 days after',
    Season: 'Spring',
    ApplicationMethod: 'Incorporated 2 days after',
    DryMatterLessThan1Percent: 0.95,
    DryMatter1To5Percent: 0.6,
    DryMatter5To10Percent: 0.45,
    DryMatterGreaterThan10Percent: 0.3,
    PoultrySolid: '0.5',
    Compost: 'Spring',
    SortNum: 130,
    ManureType: 3,
    StaticDataVersionId: 13,
  },
  {
    Id: 4,
    Name: 'Spring - Incorporated 3 days or more after',
    Season: 'Spring',
    ApplicationMethod: 'Incorporated 3 days or more after',
    DryMatterLessThan1Percent: 0.95,
    DryMatter1To5Percent: 0.55,
    DryMatter5To10Percent: 0.4,
    DryMatterGreaterThan10Percent: 0.28,
    PoultrySolid: '0.4',
    Compost: 'Spring',
    SortNum: 140,
    ManureType: 3,
    StaticDataVersionId: 13,
  },
  {
    Id: 7,
    Name: 'Spring - Broadcast, not incorporated',
    Season: 'Spring',
    ApplicationMethod: 'Broadcast, not incorporated',
    DryMatterLessThan1Percent: 0.95,
    DryMatter1To5Percent: 0.55,
    DryMatter5To10Percent: 0.4,
    DryMatterGreaterThan10Percent: 0.28,
    PoultrySolid: '0.40',
    Compost: 'Spring',
    SortNum: 100,
    ManureType: 3,
    StaticDataVersionId: 13,
  },
  {
    Id: 8,
    Name: 'Spring - Injected (deep)',
    Season: 'Spring',
    ApplicationMethod: 'Injected (deep)',
    DryMatterLessThan1Percent: 0.95,
    DryMatter1To5Percent: 0.95,
    DryMatter5To10Percent: 0.95,
    DryMatterGreaterThan10Percent: 0.95,
    PoultrySolid: 'reselect',
    Compost: 'Spring',
    SortNum: 150,
    ManureType: 1,
    StaticDataVersionId: 13,
  },
  {
    Id: 9,
    Name: 'Spring - Shallow injection',
    Season: 'Spring',
    ApplicationMethod: 'Shallow injection',
    DryMatterLessThan1Percent: 0.95,
    DryMatter1To5Percent: 0.85,
    DryMatter5To10Percent: 0.7,
    DryMatterGreaterThan10Percent: 0.7,
    PoultrySolid: 'reselect',
    Compost: 'Spring',
    SortNum: 160,
    ManureType: 1,
    StaticDataVersionId: 13,
  },
  {
    Id: 10,
    Name: 'Spring - Surface band (trailing hose, sleighfoot)',
    Season: 'Spring',
    ApplicationMethod: 'Surface band (trailing hose, sleighfoot)',
    DryMatterLessThan1Percent: 0.95,
    DryMatter1To5Percent: 0.75,
    DryMatter5To10Percent: 0.65,
    DryMatterGreaterThan10Percent: 0.6,
    PoultrySolid: 'reselect',
    Compost: 'Spring',
    SortNum: 170,
    ManureType: 1,
    StaticDataVersionId: 13,
  },
  {
    Id: 11,
    Name: 'Summer - Broadcast',
    Season: 'Summer',
    ApplicationMethod: 'Broadcast',
    DryMatterLessThan1Percent: 0.95,
    DryMatter1To5Percent: 0.38,
    DryMatter5To10Percent: 0.3,
    DryMatterGreaterThan10Percent: 0.2,
    PoultrySolid: '0.34',
    Compost: 'Summer',
    SortNum: 200,
    ManureType: 3,
    StaticDataVersionId: 13,
  },
  {
    Id: 12,
    Name: 'Summer - Injected (deep)',
    Season: 'Summer',
    ApplicationMethod: 'Injected (deep)',
    DryMatterLessThan1Percent: 0.95,
    DryMatter1To5Percent: 0.95,
    DryMatter5To10Percent: 0.95,
    DryMatterGreaterThan10Percent: 0.95,
    PoultrySolid: 'reselect',
    Compost: 'Summer',
    SortNum: 210,
    ManureType: 1,
    StaticDataVersionId: 13,
  },
  {
    Id: 13,
    Name: 'Summer - Shallow injection',
    Season: 'Summer',
    ApplicationMethod: 'Shallow injection',
    DryMatterLessThan1Percent: 0.95,
    DryMatter1To5Percent: 0.65,
    DryMatter5To10Percent: 0.56,
    DryMatterGreaterThan10Percent: 0.49,
    PoultrySolid: 'reselect',
    Compost: 'Summer',
    SortNum: 220,
    ManureType: 1,
    StaticDataVersionId: 13,
  },
  {
    Id: 14,
    Name: 'Summer - Surface band (trailing hose, sleighfoot)',
    Season: 'Summer',
    ApplicationMethod: 'Surface band (trailing hose, sleighfoot)',
    DryMatterLessThan1Percent: 0.95,
    DryMatter1To5Percent: 0.6,
    DryMatter5To10Percent: 0.5,
    DryMatterGreaterThan10Percent: 0.4,
    PoultrySolid: 'reselect',
    Compost: 'Summer',
    SortNum: 230,
    ManureType: 1,
    StaticDataVersionId: 13,
  },
  {
    Id: 15,
    Name: 'Fall - Broadcast, not incorporated',
    Season: 'Fall',
    ApplicationMethod: 'Broadcast, not incorporated',
    DryMatterLessThan1Percent: 0.95,
    DryMatter1To5Percent: 0.55,
    DryMatter5To10Percent: 0.4,
    DryMatterGreaterThan10Percent: 0.28,
    PoultrySolid: '0.40',
    Compost: 'Fall',
    SortNum: 300,
    ManureType: 3,
    StaticDataVersionId: 13,
  },
  {
    Id: 16,
    Name: 'Fall - Injected (deep)',
    Season: 'Fall',
    ApplicationMethod: 'Injected (deep)',
    DryMatterLessThan1Percent: 0.95,
    DryMatter1To5Percent: 0.95,
    DryMatter5To10Percent: 0.95,
    DryMatterGreaterThan10Percent: 0.95,
    PoultrySolid: 'reselect',
    Compost: 'Fall',
    SortNum: 310,
    ManureType: 1,
    StaticDataVersionId: 13,
  },
  {
    Id: 17,
    Name: 'Fall - Shallow injection',
    Season: 'Fall',
    ApplicationMethod: 'Shallow injection',
    DryMatterLessThan1Percent: 0.95,
    DryMatter1To5Percent: 0.85,
    DryMatter5To10Percent: 0.7,
    DryMatterGreaterThan10Percent: 0.7,
    PoultrySolid: 'reselect',
    Compost: 'Fall',
    SortNum: 320,
    ManureType: 1,
    StaticDataVersionId: 13,
  },
  {
    Id: 18,
    Name: 'Fall - Surface band (trailing hose, sleighfoot)',
    Season: 'Fall',
    ApplicationMethod: 'Surface band (trailing hose, sleighfoot)',
    DryMatterLessThan1Percent: 0.95,
    DryMatter1To5Percent: 0.75,
    DryMatter5To10Percent: 0.65,
    DryMatterGreaterThan10Percent: 0.6,
    PoultrySolid: 'reselect',
    Compost: 'Fall',
    SortNum: 330,
    ManureType: 1,
    StaticDataVersionId: 13,
  },
];

export default SEASON_APPLICATION;
