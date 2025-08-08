// FIP Knowledge Base - comprehensive data from ABCD Guidelines 2024, UC Davis, Cornell, and FIP Warriors India x FSGI Foundation
  const fipKnowledgeBase = {
    overview: {
      definition: "Feline Infectious Peritonitis (FIP) is a fatal, immune-mediated disease caused by pathotypes of feline coronavirus (FCoV). While benign enteric FCoV is ubiquitous, <5% of infected cats develop FIP after mutation and systemic dissemination.",
      prevalence: "FCoV seropositivity 30-90% in multi-cat environments; endemic in shelters and breeding catteries",
      incidence: "~0.35-5% of FCoV-infected cats develop FIP; risk highest in kittens (3-16 months)",
      breedPredisposition: ["Abyssinian", "Bengal", "Birman", "Burmese", "Devon Rex", "Ragdoll", "Rex breeds"],
      ageRisk: "75% of cases <2 years; juvenile and geriatric cats at heightened risk",
      survivalWithoutTreatment: {
        wet: "1-2 weeks",
        dry: "2-4 weeks",
        neurological: "1-3 weeks"
      }
    },
    types: {
      wet: "Usually beginning with high temperature, loss of appetite and lethargy, cats with Wet FIP have abdominal effusions usually accompanied with an enlarged abdominal cavity, basically the stomach appearing abnormally enlarged, rounded and bloated. Sometimes vomiting, diarrhea or jaundice are added.",
      pleural: "Showing similar symptoms of lethargy, high temperature and loss of appetite as Wet FIP, in Pleural FIP cats have thoracic (chest) effusions often accompanied with breathing problems (dyspnea). Sometimes this can be confused with pneumonia leading to delayed diagnosis.",
      dry: "Often more difficult to diagnose, Dry FIP also tends to be more chronic, progressing over a few weeks to months. With no fluid accumulation, this form presents itself with some subtle symptoms like fatigue and gradual weight loss, later accompanied with additional signs depending on the organs affected. Can affect abdominal organs (liver, lymph nodes, kidney, pancreas, spleen, GI tract).",
      ocular: "When the virus manages to reach the eyes it's called Ocular FIP. Uveitis can affect the eyes, making them look cloudy and changing the colour of the iris. Conjunctivitis and inflammation or bleeding in the anterior chamber are common too. Keratic precipitates, glaucoma, hyphema may occur.",
      neurological: "When the virus crosses the blood-brain barrier, inflammation can enter the brain and spinal cord and cause a spectrum of progressive neurologic abnormalities. Signs include ataxia (uncoordinated movements), head tilt, unsteady walk, floor or wall licking, postural reaction deficits, seizures, paralysis, personality changes and even dementia."
    },
    bloodworkIndicators: {
      wetFIP: {
        hematocrit: "reduced",
        reticulocyte: "normal to reduced",
        neutrophils: "increased",
        lymphocytes: "reduced",
        mcv: "reduced",
        totalProtein: "normal to elevated",
        albumin: "normal to reduced",
        globulins: "increased",
        gammaglobulins: "increased",
        ag: "reduced (<0.5)",
        bilirubin: "increased",
        acutePhaseProteins: "increased (α1-acid glycoprotein >1.5 g/L; SAA >20 mg/L)"
      },
      dryFIP: {
        hematocrit: "normal to reduced",
        reticulocyte: "normal to reduced",
        neutrophils: "increased",
        lymphocytes: "normal to reduced",
        mcv: "reduced",
        totalProtein: "normal to elevated",
        albumin: "normal to reduced",
        globulins: "increased",
        gammaglobulins: "increased",
        ag: "reduced (<0.5)",
        bilirubin: "normal to elevated",
        acutePhaseProteins: "increased (α1-acid glycoprotein >1.5 g/L; SAA >20 mg/L)"
      },
      criticalThresholds: {
        agRatio: "<0.4 highly suggestive, <0.5 supportive",
        globulin: "≥50 g/L supportive",
        effusionProtein: ">3.5 g/dL typical",
        serumLDHtoHL: ">0.9 supportive",
        FCoVantibodyTiter: "≥1:1600 supportive"
      }
    },
    diagnosticTools: {
      ultrasound: "The presence of abdominal or thoracic fluid strongly supports a diagnosis of wet or pleural FIP. One of the earliest and most telling ultrasound signs is mesenteric lymphadenopathy (>1cm). Other useful findings include renal cortical nodules, hepatic and splenic changes, thickened intestinal walls with loss of layering, or peritoneal inflammation.",
      pcr: "A positive PCR result, especially on effusion or FNA from a lymph node is highly specific for FIP (Ct <27 or viral load >10⁷ copies/mL highly confident). However, a negative result does not rule it out, especially in dry cases. Blood PCR is unreliable with false positives/negatives.",
      rivalta: "A simple, in-house test that can support FIP diagnosis. While it helps differentiate protein-rich effusions, it is not FIP-specific and both false positives and negatives are possible. Positive Rivalta with typical clinical signs warrants proceeding to minimum database.",
      imaging: "MRI is particularly useful in neuro FIP - findings may include meningeal enhancement, ventricular dilation, or brain edema. CT scans may reveal fluid accumulation, lymphadenopathy, or organ abnormalities not clearly visible on ultrasound. Advanced 3D CNN algorithms can detect <5mm renal granulomas with 89% accuracy.",
      immunohistochemistry: "Gold standard - polyclonal anti-FCoV antibody staining in macrophages adjacent to vasculitis. Definitive when paired with pyogranulomatous lesions.",
      immunocytochemistry: "Same antibodies on cytospin effusion/FNA smears; quicker than IHC. Sensitivity 82%, Specificity 95%.",
      flowCytometry: "CD11b+/Iba1+ macrophages co-expressing FCoV spike detected via FITC-mAb. Research-grade but promising.",
      serumProteinElectrophoresis: "Broad polyclonal gammopathy, increased β/γ bridge typical"
    },
    diagnosticAlgorithms: {
      rapidTriage: [
        "Signalment + History → kitten/young adult, multi-cat, stressor, vague fever",
        "Quick look (≤15 min): temperature, mucous membranes, abdominal palpation (fluid wave test)",
        "Point-of-care: Rivalta on any free fluid, handheld refractometer for TP, SNAP FCoV Ab if available",
        "Decision: If Rivalta+, TP >3.5 g/dL and clinical signs typical → move to Minimum Database"
      ],
      effusiveFIP: [
        "Effusion present → Rivalta test",
        "If Positive → Effusion RT-qPCR for FCoV",
        "Ct <27 or viral load >10⁷ copies/mL → Highly Confident FIP",
        "Ct ≥27 → Proceed to ICC/IHC on cell block; consider tissue biopsy"
      ],
      nonEffusiveFIP: [
        "Focused ultrasound → renal cortical nodules, splenomegaly, mesenteric LN >1cm",
        "Fine-needle aspirate from two organs → cytology + RT-qPCR",
        "If PCR equivocal: Tru-cut biopsy + histopathology + IHC for FCoV antigen"
      ]
    },
    scoringSystems: {
      modifiedFIPScore: {
        formula: "Score = (A/G ≤0.4)*3 + (Globulin ≥50 g/L)*2 + (Age <2 yrs)*1 + (Effusion Rivalta +)*2 + (FCoV titre ≥1:1600)*2",
        interpretation: "≥7 points → treat as FIP"
      },
      FIPCalc: "UC Davis web app integrating 19 variables; AUROC 0.94",
      CRPSAACombo: "CRP >40 mg/L & SAA >30 mg/L with A/G <0.6 gives 90% PPV"
    },
    recommendedSamples: {
      wet: "Effusion (no more than 30% of abdominal fluid removed at once)",
      pleural: "Effusion (entire volume drained if dyspnea present)",
      dry: "Fine needle aspirate of affected Mesenteric Lymph Nodes",
      ocular: "Aqueous humor",
      neurological: "Cerebrospinal fluid (via CSF tap) - ↑protein >0.3 g/dL, neutrophilic pleocytosis, Ct <28 highly supportive"
    },
    sampleHandling: {
      effusionPCR: { container: "EDTA (purple)", temperature: "4°C", maxTransit: "48h" },
      tissueBiopsy: { container: "Formalin + separate fresh for PCR", temperature: "RT/4°C", maxTransit: "72h" },
      CSF: { container: "Plain sterile tube", temperature: "Ice pack", maxTransit: "24h" },
      aqueousHumor: { container: "Plain sterile", temperature: "Ice pack", maxTransit: "24h" }
    },
    differentialDiagnosis: {
      lymphoma: { keyTests: "PARR clonality, FeLV status, ultrasonographic splenic pattern", overlaps: "Granulomas, effusion" },
      toxoplasmosis: { keyTests: "IgM ≥1:64, PCR for T. gondii", overlaps: "Pyrexia, neuro-ocular signs" },
      bacterialPeritonitis: { keyTests: "Effusion cytology (degenerate neutrophils, bacteria), culture", overlaps: "Septic effusion" },
      chylothorax: { keyTests: "Effusion triglycerides >serum", overlaps: "Milky effusion" },
      CHF: { keyTests: "NT-proBNP >270 pmol/L, echocardiography", overlaps: "Pleural effusion" }
    },
    treatmentProtocols: {
      GS441524: {
        description: "Most widely used antiviral, blocks viral replication. Parent compound of Remdesivir.",
        standardDuration: "Minimum 84 days",
        dosingInjectable: {
          wet: "Minimum 8 mg/kg",
          dry: "Minimum 8 mg/kg",
          pleural: "Minimum 10 mg/kg",
          ocular: "Minimum 10 mg/kg",
          neurological: "Minimum 12 mg/kg (up to 40 mg/kg in complex cases)"
        },
        dosingOral: "Double the injectable dose due to ~50% bioavailability",
        initialProtocol: "Strongly recommended to begin with injectable for first 2-4 weeks for faster stabilization",
        responseTime: "Signs of improvement within 24-72 hours (fever resolves, appetite returns)"
      },
      remdesivir: {
        description: "Prodrug that metabolizes to GS-441524, legally available in India",
        dosingProtocol: {
          wet: "Minimum 12-15 mg/kg",
          dry: "Minimum 12-15 mg/kg",
          pleural: "Minimum 15 mg/kg",
          ocular: "Minimum 15-20 mg/kg",
          neurological: "Minimum 20 mg/kg"
        }
      },
      monitoring: {
        baseline: "CBC, serum chemistry, UA, body weight",
        duringTherapy: "Every 4 weeks: CBC, ALT/AST, albumin, globulin, A/G ratio",
        imaging: "Repeat ultrasound at 6 weeks for effusion/organ lesions",
        endOfTreatment: "Normal hematocrit, A/G ≥0.8, resolution of effusions/lesions, stable weight",
        postTreatment: "Monthly checks ×3 months, then bi-annual for 1 year"
      }
    },
    prognosis: {
      earlyWetDry: { remissionRate: "85-95%", medianSurvival: ">12 months" },
      ocular: { remissionRate: "75-85%", medianSurvival: "6-12 months" },
      neurological: { remissionRate: "60-70%", medianSurvival: "4-8 months" },
      delayedTreatment: { remissionRate: "<50%", medianSurvival: "<6 months" }
    }
  };
