import React, { useState, useRef } from 'react';
import { Upload, Send, FileText, Image, MessageCircle, AlertTriangle, Stethoscope, CheckCircle, Info, BookOpen, Activity } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const FIPDiagnosticChatbot = () => {
  // All state declarations
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Welcome! I'm an advanced FIP Diagnostic & Treatment Assistant with comprehensive veterinary knowledge from:
• ABCD Europe Guidelines (2024)
• UC Davis CCAH Protocols
• FIP Warriors® India x FSGI Foundation Treatment Guide
• Latest peer-reviewed research through 2025

I can help with:
✓ FIP diagnosis using evidence-based algorithms
✓ Blood work interpretation (A:G ratio, proteins, CBC)
✓ Treatment protocols (GS-441524, Remdesivir, combination therapy)
✓ Dosing calculations for all FIP types
✓ Monitoring schedules and relapse management
✓ Emergency signs recognition

Please upload your cat's medical documents or describe their symptoms to begin assessment.`
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const fileInputRef = useRef(null);

  // Comprehensive FIP Knowledge Base - Updated with new document
  const fipKnowledgeBase = {
    overview: {
      definition: "FIP is a fatal, immune-mediated disease caused by pathotypes of feline coronavirus (FCoV)",
      prevalence: "FCoV seropositivity 30-90% in multi-cat environments; <5% develop FIP",
      mortality: "Nearly 100% fatal without treatment; 85-95% remission with early antiviral therapy",
      pathogenesis: "Mutation in 3c, 7b and spike protein genes yields FIPV with macrophage tropism"
    },
    
    riskFactors: {
      age: "75% of cases <2 years; highest risk 3-16 months",
      breeds: ["Abyssinian", "Bengal", "Birman", "Burmese", "Devon Rex", "Ragdoll", "Rex breeds"],
      environmental: ["Overcrowding", "New cat introductions", "Immunosuppression", "Pregnancy", "Recent surgery/illness"],
      genetics: "Host susceptibility loci under investigation"
    },
    
    types: {
      wet: {
        description: "Immune complex-driven vasculitis with high-protein effusions",
        symptoms: "Abdominal distension, dyspnea, pleural/peritoneal effusion, fever, anorexia",
        medianSurvival: "1-2 weeks without treatment",
        keyFindings: "Straw-gold viscous effusion, TP >3.5 g/dL, low TNCC (<5×10³/µL)"
      },
      
      injectionGuidance: {
        technique: "Subcutaneous only - rotate sites between shoulders, sides, lower back",
        preparation: "Room temperature GS, have treats ready, wrap in towel if needed",
        timing: "Same time daily (within 1-2 hours), consistency crucial",
        normalReactions: "Stinging normal, small blood drops OK, lumps at injection site",
        migration: "Fluid may migrate to armpit/side - absorbs in 24 hours",
        vagalResponse: "Rare collapse/fainting post-injection - recovers in 5-10 minutes"
      },
      
      emergencySigns: {
        respiratory: "Labored breathing, open-mouth breathing",
        neurological: "Seizures, fixed pupils, sudden collapse",
        cardiovascular: "Pale/white gums, hypothermia <97°F",
        renal: "No urination >24 hours",
        hepatic: "Severe jaundice, extreme lethargy",
        general: "Not eating >48 hours, severe dehydration"
      },
      
      brandGuidance: {
        gs441524: "Most accessed through caregiver networks from China",
        quality: "Verify with admin groups - avoid brands with unproven claims",
        warning: "Beware '30-day cure' claims - minimum 84 days required",
        legal: "GS not legally available in India; Remdesivir is legal alternative"
      },
      dry: {
        description: "Granulomas in multiple organs without effusion",
        symptoms: "Chronic fever, weight loss, lethargy, organ-specific signs",
        medianSurvival: "2-4 weeks without treatment",
        keyFindings: "Mesenteric lymphadenopathy >1cm, renal cortical nodules, splenomegaly"
      },
      ocular: {
        description: "Anterior uveitis, chorioretinitis when virus reaches eyes",
        symptoms: "Uveitis, keratic precipitates, glaucoma, hyphema, iris color change",
        medianSurvival: "Variable, depends on systemic involvement",
        keyFindings: "Aqueous humor PCR positive, inflammatory cells in anterior chamber"
      },
      neurological: {
        description: "Meningitis, ependymitis when virus crosses blood-brain barrier",
        symptoms: "Ataxia, seizures, paresis, behavioral changes, head tilt, dementia",
        medianSurvival: "1-3 weeks without treatment",
        keyFindings: "CSF protein >0.3 g/dL, neutrophilic pleocytosis, MRI enhancement"
      }
    },
    
    diagnosticCriteria: {
      minimumDatabase: {
        cbc: {
          findings: "Non-regenerative anemia, lymphopenia <1.5×10⁹/L, neutrophilia",
          weight: "HIGH"
        },
        chemistry: {
          findings: "Hyperglobulinemia >50g/L, hypoalbuminemia, A:G <0.4",
          weight: "HIGH"
        },
        acutePhaseProteins: {
          findings: "α1-acid glycoprotein >1.5 g/L, SAA >20 mg/L",
          weight: "HIGH"
        },
        effusionAnalysis: {
          findings: "Rivalta positive, TP >3.5 g/dL, low cellularity",
          weight: "HIGH"
        }
      },
      
      confirmatory: {
        rtPCR: {
          method: "RT-qPCR on effusion, FNA, or tissue",
          interpretation: "Ct <27 or >10⁷ copies/mL highly confident",
          specificity: "95% when combined with clinical signs"
        },
        immunohistochemistry: {
          method: "FCoV antigen in macrophages",
          interpretation: "Gold standard when paired with pyogranulomatous vasculitis",
          specificity: "Near 100%"
        },
        scoringSystems: {
          fipScore: "≥7 points indicates FIP (A:G, globulin, age, Rivalta, titre)",
          ucDavisCalc: "AUROC 0.94 with 19 variables"
        }
      }
    },
    
    diagnosticAlgorithms: {
      wetFIP: {
        step1: "Effusion present → Perform Rivalta test",
        step2: "If Rivalta positive → RT-qPCR on effusion",
        step3: "Ct <27 → Highly confident FIP diagnosis",
        step4: "Ct ≥27 → ICC/IHC on cell block or tissue biopsy"
      },
      dryFIP: {
        step1: "Focused ultrasound → identify organ changes",
        step2: "FNA from 2 organs → cytology + RT-qPCR",
        step3: "If PCR equivocal → Tru-cut biopsy + histopathology + IHC",
        step4: "Pyogranulomatous vasculitis + FCoV antigen = definitive"
      },
      neurologicalFIP: {
        step1: "MRI brain/spine → meningeal enhancement, ventricular dilation",
        step2: "CSF analysis → protein >0.3 g/dL, neutrophilic pleocytosis",
        step3: "CSF RT-qPCR → Ct <28 highly supportive",
        step4: "Consider aqueous humor tap if ocular signs present"
      }
    },
    
    bloodworkIndicators: {
      wetFIP: {
        hematocrit: "Reduced (<30%)",
        reticulocyte: "Normal to reduced",
        neutrophils: "Increased (>12×10⁹/L)",
        lymphocytes: "Reduced (<1.5×10⁹/L)",
        mcv: "Reduced",
        totalProtein: "Normal to elevated (>75 g/L)",
        albumin: "Normal to reduced (<25 g/L)",
        globulins: "Increased (>50 g/L)",
        gammaglobulins: "Increased with broad polyclonal peak",
        ag: "Reduced (<0.4 diagnostic, <0.5 suspicious)",
        bilirubin: "Increased (>2 mg/dL)",
        acutePhaseProteins: "Markedly increased",
        alt: "Mild to moderate increase",
        ldh_hl_ratio: ">0.9 supportive"
      },
      dryFIP: {
        hematocrit: "Normal to reduced",
        reticulocyte: "Normal to reduced",
        neutrophils: "Increased",
        lymphocytes: "Normal to reduced",
        mcv: "Reduced",
        totalProtein: "Normal to elevated",
        albumin: "Normal to reduced",
        globulins: "Increased (>45 g/L)",
        gammaglobulins: "Increased",
        ag: "Reduced (<0.5)",
        bilirubin: "Normal to elevated",
        acutePhaseProteins: "Increased",
        alt: "Variable elevation"
      }
    },
    
    differentialDiagnosis: {
      lymphoma: {
        distinguishing: "PARR clonality, FeLV status, ultrasonographic pattern",
        overlaps: "Granulomas, effusion, weight loss"
      },
      toxoplasmosis: {
        distinguishing: "IgM ≥1:64, PCR for T. gondii",
        overlaps: "Pyrexia, neuro-ocular signs"
      },
      bacterialPeritonitis: {
        distinguishing: "Degenerate neutrophils, bacteria on cytology, culture positive",
        overlaps: "Septic effusion, fever"
      },
      chylothorax: {
        distinguishing: "Effusion triglycerides >serum",
        overlaps: "Milky effusion"
      },
      chf: {
        distinguishing: "NT-proBNP >270 pmol/L, echocardiography",
        overlaps: "Pleural effusion, dyspnea"
      }
    },
    
    treatment: {
      antivirals: {
        gs441524: {
          injectable: {
            wetFIP: "Minimum 8 mg/kg SC q24h",
            dryFIP: "Minimum 8 mg/kg SC q24h",
            pleuralFIP: "Minimum 10 mg/kg SC q24h",
            ocularFIP: "Minimum 10 mg/kg SC q24h",
            neurologicalFIP: "Minimum 12 mg/kg SC q24h",
            criticalProtocol: "Full dose may be split q12h until stable"
          },
          oral: {
            dosing: "Double the injectable dose due to 50% bioavailability",
            maxDose: "If >30mg/kg (15mg/kg injectable equivalent), split to q12h",
            fasting: "Fast 1 hour before and 1 hour after administration"
          },
          duration: "Minimum 84 days",
          startProtocol: "Injectable for first 2-4 weeks (10% higher survival rate)",
          monitoring: "Weekly weight checks MANDATORY - adjust dose for weight gain",
          remissionRate: "85-95% for non-neurological with proper dosing",
          storage: "Room temperature, away from direct light"
        },
        remdesivir: {
          dosing: {
            wetFIP: "Minimum 12 mg/kg, ideally 15 mg/kg",
            dryFIP: "Minimum 12 mg/kg, ideally 15 mg/kg",
            pleuralFIP: "Minimum 15 mg/kg",
            ocularFIP: "Minimum 15 mg/kg, ideally 20 mg/kg",
            neurologicalFIP: "Minimum 20 mg/kg"
          },
          administration: "IV initially, then SC at home",
          duration: "Minimum 84 days",
          storage: "Refrigerate after reconstitution",
          notes: "Legal in India as human drug, off-label veterinary use",
          sideEffects: "Similar to GS, rare pleural effusion, monitor kidney function"
        },
        eidd: {
          molnupiravir: {
            dose: "10-15 mg/kg PO q12h",
            availability: "Legal in India for human COVID-19",
            use: "GS-resistant cases, relapse with neuro/ocular"
          },
          eidd1931: {
            dose: "10-15 mg/kg PO q12h",
            cns_penetration: "Better than EIDD-2801",
            availability: "Unregulated"
          },
          duration: "Minimum 84 days",
          toxicityMonitoring: "WBC count, floppy ears, broken whiskers, hair loss",
          warnings: "MUTAGENIC - Never use in kittens or pregnant cats",
          contraindications: "Not first-line; reserve for resistant/relapsed cases"
        },
        gc376: {
          dose: "15 mg/kg SC q12h",
          use: "Combination therapy, when GS unavailable",
          efficacy: "Less effective for neuro/ocular",
          notes: "Expected veterinary release soon by Anivive"
        },
        nirmatrelvir: {
          use: "Experimental - advanced neuro relapses only",
          availability: "Research settings only",
          notes: "Do not use without veterinary supervision"
        }
      },
      supportive: {
        appetite: {
          mirtazapine: "1.88-3.75 mg/cat q48h",
          maropitant: "1 mg/kg SC q24h for nausea",
          ondansetron: "0.5-1 mg/kg PO/SC q12-24h"
        },
        hepatic: {
          same: "20 mg/kg PO q24h",
          silymarin: "5-10 mg/kg PO q24h",
          monitoring: "ALT/AST q2-4 weeks"
        },
        neurological: {
          levetiracetam: "20 mg/kg PO q8h (up to 60 mg/kg for severe)",
          gabapentin: "5-10 mg/kg PO q8-12h",
          phenobarbital: "2-3 mg/kg PO q12h (monitor liver)"
        },
        hydration: "SC fluids 10-20 mL/kg as needed",
        nutrition: "200-250 kcal/day minimum, small frequent meals",
        probiotics: "FortiFlora or similar daily",
        b12: "250 mcg SC weekly if anemic/GI issues"
      },
      contraindicated: {
        lysine: "NEVER give - antagonizes arginine, interferes with GS",
        antibiotics_avoid: [
          "Fluoroquinolones (Baytril, Enrofloxacin, Zeniquin)",
          "Marbofloxacin, Pradofloxacin, Orbifloxacin",
          "Convenia (long-acting cephalosporin)"
        ],
        antibiotics_safe: [
          "Doxycycline", "Amoxicillin", "Augmentin",
          "Clindamycin", "Cephalexin", "Penicillin"
        ],
        flea_treatment: "Avoid during treatment - use flea comb instead"
      },
      monitoring: {
        weight: "Weekly weighing MANDATORY - adjust dose immediately",
        bloodwork: "CBC & Chemistry q4 weeks (q2 weeks if using EIDD)",
        observation: "84-day post-treatment observation period",
        sterilization: "Safest between weeks 8-10, minimum 2 weeks GS post-surgery"
      },
      relapse: {
        signs: "Fever return, appetite loss, new neuro signs, effusions",
        protocol: "Restart injectable immediately at previous dose +5 mg/kg",
        neuroRelapse: "Start at 15 mg/kg injectable minimum",
        combination: "Consider adding EIDD under expert guidance",
        duration: "Another full 84 days"
      }
    },
    
    prognosis: {
      earlyTreatment: {
        wetDry: "85-95% remission, >12mo survival",
        ocular: "75-85% remission, 6-12mo survival",
        neurological: "60-70% remission, 4-8mo survival"
      },
      delayedTreatment: {
        overall: "<50% remission, <6mo survival",
        factors: "Treatment delay >2 weeks significantly worsens prognosis"
      }
    },
    
    sampleCollection: {
      effusion: {
        container: "EDTA (purple top)",
        temperature: "4°C",
        maxTransit: "48 hours"
      },
      tissue: {
        container: "Formalin + fresh for PCR",
        temperature: "RT/4°C",
        maxTransit: "72 hours"
      },
      csf: {
        container: "Plain sterile tube",
        temperature: "Ice pack",
        maxTransit: "24 hours"
      },
      aqueousHumor: {
        container: "Plain sterile",
        temperature: "Ice pack",
        maxTransit: "24 hours"
      }
    }
  };

  // Helper function to convert data URL to array buffer
  const dataURLToArrayBuffer = (dataURL) => {
    const base64 = dataURL.split(',')[1];
    const binaryString = window.atob(base64);
    const arrayBuffer = new ArrayBuffer(binaryString.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    
    for (let i = 0; i < binaryString.length; i++) {
      uint8Array[i] = binaryString.charCodeAt(i);
    }
    
    return arrayBuffer;
  };

  // PDF to Image conversion function
  const convertPdfToImages = async (pdfFile) => {
    try {
      setIsProcessingPdf(true);
      
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      const images = [];
      
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        const scale = 2.0;
        const viewport = page.getViewport({ scale });
        
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;
        
        const imageDataUrl = canvas.toDataURL('image/png', 0.9);
        
        const imageFile = {
          name: `${pdfFile.name}_page_${pageNum}.png`,
          type: 'image/png',
          size: imageDataUrl.length * 0.75,
          file: {
            arrayBuffer: () => Promise.resolve(dataURLToArrayBuffer(imageDataUrl))
          },
          dataUrl: imageDataUrl
        };
        
        images.push(imageFile);
      }
      
      return images;
    } catch (error) {
      console.error('Error converting PDF to images:', error);
      throw new Error(`Failed to convert PDF: ${error.message}`);
    } finally {
      setIsProcessingPdf(false);
    }
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    const processedFiles = [];
    
    for (const file of files) {
      if (file.type === 'application/pdf') {
        try {
          const convertedImages = await convertPdfToImages(file);
          processedFiles.push(...convertedImages);
        } catch (error) {
          console.error('PDF conversion error:', error);
          processedFiles.push({
            name: file.name,
            type: file.type,
            size: file.size,
            file: file,
            conversionError: error.message
          });
        }
      } else {
        processedFiles.push({
          name: file.name,
          type: file.type,
          size: file.size,
          file: file
        });
      }
    }
    
    setUploadedFiles(prev => [...prev, ...processedFiles]);
  };

  const analyzeWithOpenAI = async (userInput, files = []) => {
    try {
      // Prepare comprehensive system message with full knowledge base
      const systemMessage = `You are an advanced FIP (Feline Infectious Peritonitis) diagnostic and treatment assistant with comprehensive veterinary knowledge from ABCD Europe, UC Davis CCAH, FIP Warriors® India x FSGI Foundation, and peer-reviewed literature through 2025.

COMPREHENSIVE FIP KNOWLEDGE BASE:

${JSON.stringify(fipKnowledgeBase, null, 2)}

CRITICAL CLINICAL INSTRUCTIONS:

DIAGNOSIS:
1. Follow diagnostic algorithms systematically (wet→Rivalta→PCR; dry→ultrasound→FNA)
2. A:G ratio <0.4 is DIAGNOSTIC, <0.5 is SUSPICIOUS for FIP
3. FIP-Score ≥7 points indicates FIP
4. PCR on effusion/FNA: Ct <27 highly confident
5. Gold standard: IHC showing FCoV in macrophages + pyogranulomatous vasculitis

TREATMENT PROTOCOLS:
1. GS-441524 Injectable Dosing (EVF Guidelines):
   - Wet/Dry: 8 mg/kg minimum
   - Pleural: 10 mg/kg minimum
   - Ocular: 10 mg/kg minimum
   - Neurological: 12 mg/kg minimum
   - Critical cases: Split dose q12h initially
   
2. Start with injectable for 2-4 weeks (10% higher survival rate)
3. Oral GS requires DOUBLE the injectable dose (50% bioavailability)
4. Duration: MINIMUM 84 days + 84 days observation
5. Weekly weight checks MANDATORY - adjust dose immediately
6. Remdesivir available as legal alternative in India

MONITORING:
- CBC & Chemistry every 4 weeks
- Target: A:G ≥0.8, normal hematocrit, effusion resolution
- Watch for relapse signs during 84-day observation
- Relapse protocol: Previous dose +5 mg/kg injectable

EMERGENCY SIGNS:
- Labored breathing, seizures, pale gums
- No urination >24 hours, hypothermia <97°F
- Immediate veterinary care required

CONTRAINDICATIONS:
- NEVER give Lysine (interferes with GS)
- Avoid fluoroquinolones in neuro cases
- No flea treatments during therapy

PROGNOSIS:
- Early treatment: 85-95% remission (wet/dry)
- Neurological: 60-70% remission
- Delayed treatment (>2 weeks): <50% remission

When providing recommendations:
1. Always calculate specific doses based on weight and FIP type
2. Emphasize the importance of proper dosing and weight monitoring
3. Provide both GS-441524 and Remdesivir options (noting Remdesivir is legal in India)
4. Include supportive care recommendations
5. Stress veterinary consultation importance
6. Maintain conversation context and refer to previous information
7. For images: Identify effusions, lymphadenopathy, organ changes, ocular/neurological signs`;

      // Convert conversation history to API format
      const conversationMessages = [];
      
      conversationMessages.push({
        role: "system",
        content: systemMessage
      });

      // Add previous messages (excluding initial greeting)
      for (let i = 1; i < messages.length; i++) {
        const msg = messages[i];
        if (msg.role === 'user') {
          let content = msg.content;
          if (msg.files && msg.files.length > 0) {
            content += `\n\nFiles uploaded: ${msg.files.map(f => f.name).join(', ')}`;
          }
          conversationMessages.push({
            role: "user",
            content: content
          });
        } else if (msg.role === 'assistant') {
          conversationMessages.push({
            role: "assistant",
            content: msg.content
          });
        }
      }

      // Prepare current user message
      let userMessageContent = [];
      let textContent = "";
      
      if (userInput) {
        textContent += `Patient Information: ${userInput}\n\n`;
      }
      
      // Handle uploaded files
      const imageFiles = files.filter(f => f.type.startsWith('image/'));
      const pdfFiles = files.filter(f => f.type === 'application/pdf');
      
      if (imageFiles.length > 0) {
        textContent += `${imageFiles.length} medical image(s) uploaded for FIP analysis.\n\n`;
        
        for (const file of imageFiles) {
          try {
            let base64Data;
            
            if (file.dataUrl) {
              base64Data = file.dataUrl.split(",")[1];
            } else {
              base64Data = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                  const base64 = reader.result.split(",")[1];
                  resolve(base64);
                };
                reader.onerror = reject;
                reader.readAsDataURL(file.file);
              });
            }

            userMessageContent.push({
              type: "image_url",
              image_url: {
                url: `data:image/png;base64,${base64Data}`,
                detail: "high"
              }
            });
          } catch (error) {
            console.error("Error processing image:", error);
            textContent += `Error processing image: ${file.name}\n`;
          }
        }
      }

      // Assessment request
      textContent += `Please provide a comprehensive FIP assessment following the diagnostic algorithms:

1. **Initial Triage**: Signalment, history, clinical signs matching FIP types
2. **Laboratory Analysis**: Focus on A:G ratio, globulins, albumin, CBC findings
3. **FIP Score Calculation**: Apply modified FIP-Score if data available
4. **Image Analysis**: Identify effusions, lymphadenopathy, organ changes
5. **Diagnostic Algorithm**: Follow wet/dry/neuro pathway as appropriate
6. **Differential Diagnosis**: Rule out key differentials
7. **Treatment Recommendations**: If FIP suspected, provide specific GS-441524 dosing
8. **Monitoring Plan**: Outline follow-up testing schedule
9. **Prognosis**: Based on type and treatment timing

Format your response with clear sections and emphasize critical findings.`;

      userMessageContent.push({
        type: "text",
        text: textContent
      });

      conversationMessages.push({
        role: "user",
        content: userMessageContent
      });

      console.log("Calling backend API with comprehensive knowledge base...");

      const apiEndpoint = '/.netlify/functions/openai';

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: conversationMessages,
          model: "gpt-4o-mini"
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Backend API Error:", errorData);
        
        if (response.status === 401) {
          return "❌ **Authentication Error**: Server API key configuration issue. Please contact the administrator.";
        } else if (response.status === 429) {
          return "⏳ **Rate Limit**: Too many requests. Please wait a moment and try again.";
        } else if (response.status === 500 && errorData.error?.includes('API key not configured')) {
          return "⚙️ **Configuration Error**: Server API key not configured. Please deploy with OPENAI_API_KEY environment variable.";
        } else {
          return `❌ **API Error** (${response.status}): ${errorData.error || 'Unknown error'}`;
        }
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error("Invalid response format from API");
      }

      return data.choices[0].message.content;

    } catch (error) {
      console.error("Error in analyzeWithOpenAI:", error);
      
      if (error.message.includes('fetch')) {
        return `❌ **Connection Error**: Cannot connect to backend. Ensure Netlify function is deployed and OPENAI_API_KEY is configured.`;
      }
      
      return `❌ **Error**: ${error.message}`;
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && uploadedFiles.length === 0) return;

    const userMessage = {
      role: 'user',
      content: inputMessage || 'I have uploaded files for analysis.',
      files: uploadedFiles
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setInputMessage('');
    setUploadedFiles([]);

    try {
      const response = await analyzeWithOpenAI(inputMessage, uploadedFiles);
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize, but I encountered an error while processing your request. Please try again or consult with your veterinarian.'
      }]);
    }

    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8">
            <div className="flex items-center gap-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-full">
                <Stethoscope className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">Advanced FIP Diagnostic Assistant</h1>
                <p className="text-blue-100 text-lg">Evidence-based assessment using ABCD Europe & UC Davis protocols</p>
              </div>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="p-4 bg-green-50 border-b border-green-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Ready for Analysis - Comprehensive Knowledge Base Active</span>
            </div>
            <p className="text-xs text-green-700 mt-1">
              Updated with latest 2024-2025 guidelines. Upload medical documents to begin assessment.
            </p>
          </div>

          {/* Key Information Cards */}
          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 border-l-4 border-red-500 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <h3 className="font-semibold text-gray-800">Critical</h3>
                </div>
                <p className="text-sm text-gray-600">A:G &lt;0.4 diagnostic<br/>A:G &lt;0.5 suspicious</p>
              </div>
              
              <div className="bg-white rounded-xl p-4 border-l-4 border-amber-500 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <Activity className="w-5 h-5 text-amber-500" />
                  <h3 className="font-semibold text-gray-800">FIP Score</h3>
                </div>
                <p className="text-sm text-gray-600">≥7 points = FIP<br/>Integrates 5 parameters</p>
              </div>
              
              <div className="bg-white rounded-xl p-4 border-l-4 border-green-500 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <h3 className="font-semibold text-gray-800">Prognosis</h3>
                </div>
                <p className="text-sm text-gray-600">85-95% remission<br/>with early treatment</p>
              </div>
              
              <div className="bg-white rounded-xl p-4 border-l-4 border-blue-500 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <BookOpen className="w-5 h-5 text-blue-500" />
                  <h3 className="font-semibold text-gray-800">Algorithms</h3>
                </div>
                <p className="text-sm text-gray-600">Wet, Dry, Neuro<br/>diagnostic pathways</p>
              </div>
            </div>

            {/* Quick Reference - Diagnostic Workflow */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <h4 className="font-semibold text-blue-800 mb-2">Diagnostic Workflow</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p>• <strong>Wet FIP:</strong> Effusion → Rivalta → RT-PCR (Ct &lt;27 = confident)</p>
                <p>• <strong>Dry FIP:</strong> Ultrasound → FNA (2 organs) → PCR/Histopathology</p>
                <p>• <strong>Neuro FIP:</strong> MRI → CSF analysis → CSF PCR (Ct &lt;28)</p>
                <p>• <strong>Treatment:</strong> GS-441524: 10-20 mg/kg based on type, 84+ days</p>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-amber-800 mb-1">Medical Disclaimer</h4>
                  <p className="text-sm text-amber-700">
                    This tool provides evidence-based educational information following veterinary guidelines from ABCD Europe, UC Davis, and peer-reviewed literature. 
                    Always consult a qualified veterinarian for diagnosis and treatment. GS-441524 usage may require compounding pharmacy access.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Chat Messages */}
          <div className="h-96 overflow-y-auto p-6 space-y-6 bg-gray-50">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-4xl rounded-2xl p-5 ${
                  message.role === 'user' 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' 
                    : 'bg-white border border-gray-200 shadow-sm'
                }`}>
                  <div className="flex items-start gap-3">
                    {message.role === 'assistant' && (
                      <div className="bg-blue-100 p-2 rounded-full flex-shrink-0">
                        <MessageCircle className="w-4 h-4 text-blue-600" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      {message.files && message.files.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {message.files.map((file, fileIndex) => (
                            <div key={fileIndex} className={`flex items-center gap-3 p-3 rounded-lg ${
                              message.role === 'user' ? 'bg-white bg-opacity-20' : 'bg-gray-50'
                            }`}>
                              {file.type.startsWith('image/') ? 
                                <Image className="w-4 h-4" /> : 
                                <FileText className="w-4 h-4" />
                              }
                              <span className="text-sm font-medium">{file.name}</span>
                              <span className="text-xs opacity-75">
                                {(file.size / 1024).toFixed(1)} KB
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <MessageCircle className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="text-sm text-gray-500">Analyzing with comprehensive knowledge base...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t bg-white p-6">
            {uploadedFiles.length > 0 && (
              <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <Upload className="w-4 h-4 text-blue-600" />
                  <p className="text-sm font-semibold text-blue-800">Files ready for analysis:</p>
                </div>
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
                      <div className="flex items-center gap-3">
                        {file.type.startsWith('image/') ? 
                          <Image className="w-4 h-4 text-gray-500" /> : 
                          <FileText className="w-4 h-4 text-gray-500" />
                        }
                        <div>
                          <span className="text-sm font-medium text-gray-700">{file.name}</span>
                          {file.conversionError && (
                            <p className="text-xs text-red-600">Conversion failed: {file.conversionError}</p>
                          )}
                          {file.name.includes('_page_') && (
                            <p className="text-xs text-green-600">✓ Converted from PDF</p>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                      <button
                        onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== index))}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                {isProcessingPdf && (
                  <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm text-yellow-800">Converting PDF to images for analysis...</span>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.txt,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-200 shadow-sm font-medium"
              >
                <Upload className="w-4 h-4" />
                Upload Medical Documents
              </button>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Describe symptoms, provide blood work values, or ask specific questions about FIP diagnosis..."
                  className="flex-1 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none shadow-sm min-h-[100px]"
                  rows="3"
                />
                
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || isProcessingPdf || (!inputMessage.trim() && uploadedFiles.length === 0)}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg font-medium flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  <span className="sm:hidden">Analyze</span>
                </button>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 mt-3 text-center">
              Upload blood work, X-rays, ultrasound images, or medical reports • Supported: PDF, JPG, PNG, DOC, TXT • Based on 2024-2025 veterinary guidelines
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FIPDiagnosticChatbot;
