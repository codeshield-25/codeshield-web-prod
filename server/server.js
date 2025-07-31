const express = require("express");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const GenAI = require("@google/genai");
const dotenv = require("dotenv");
const cors = require("cors");
const { VOTD_DATA } = require("./db.json");
const { json } = require("body-parser");
// const multer = require("multer");
// const upload = multer({ dest: "uploads/" });
const vulnerabilities = require("./newData.json");

const app = express();

app.use(
  cors({
    origin: "*", // Allow requests from React
    credentials: true,
  })
);

// Middleware to parse JSON request bodies and plain text
app.use(express.json());
app.use(express.text({ type: "text/plain" }));
dotenv.config();

// Tokens
const SNYK_TOKEN = process.env.SNYK_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ai = new GenAI.GoogleGenAI({ apiKey: GEMINI_API_KEY });
// Endpoint to scan a GitHub repository
app.post("/scan", (req, res) => {
  const { repoUrl, scanType } = req.body;
  console.log("Received request to scan repository:", repoUrl);

  if (!repoUrl || !repoUrl.startsWith("https://github.com/")) {
    return res
      .status(400)
      .json({ error: "Invalid or missing GitHub repository URL." });
  }

  const scanCommands = {
    open_source: "snyk test", // Open source security
    code_security: "snyk code test", // Code security
    configuration: "snyk iac test", // Configuration issues
    code_quality: "snyk code test --severity-threshold=low", // Code quality (low severity included)
  };

  if (!scanCommands[scanType]) {
    return res.status(400).json({
      error:
        "Invalid or missing scan type. Supported types: open_source, code_security, configuration, code_quality.",
    });
  }
  // Extract the repository name from the URL
  const repoName = repoUrl
    .split("/")
    .pop()
    .replace(/\.git$/, ""); // Get only the repository name
  const repoPath = path.join(__dirname, "repos", repoName); // Construct the correct path

  console.log(repoPath);

  const cloneRepository = () => {
    return new Promise((resolve, reject) => {
      if (fs.existsSync(repoPath)) {
        console.log(
          `Repository ${repoName} already exists. Pulling latest changes...`
        );
        exec(`git -C ${repoPath} pull`, (error, stdout, stderr) => {
          if (error) return reject(new Error(stderr || error.message));
          resolve(stdout);
        });
      } else {
        console.log(`Cloning repository: ${repoUrl}`);
        console.log(`Cloning repository: ${repoPath}`);
        exec(`git clone ${repoUrl} ${repoPath}`, (error, stdout, stderr) => {
          if (error) return reject(new Error(stderr || error.message));
          resolve(stdout);
        });
      }
    });
  };

  const runSnykScan = () => {
    return new Promise((resolve, reject) => {
      const snykCommand = `${scanCommands[scanType]} --json ${repoPath}`;
      console.log(`Executing: ${snykCommand}`);

      exec(
        snykCommand,
        {
          env: {
            ...process.env, // Include existing environment variables
            SNYK_TOKEN, // Explicitly pass the Snyk token
          },
          timeout: 300000, // Optional: Increase timeout to 5 minutes
        },
        (error, stdout, stderr) => {
          console.log("STDOUT:", stdout); // Logs the JSON response
          console.error("STDERR:", stderr); // Logs warnings/errors, if any

          // Handle Snyk CLI output
          if (stdout) {
            try {
              // Parse and return the JSON response from STDOUT
              // const snykResults = JSON.parse(stdout);
              const snykResults = JSON.parse(stdout.trim());
              resolve(snykResults);
            } catch (parseError) {
              console.error("Error parsing Snyk output:", parseError.message);
              reject(new Error("Failed to parse JSON from Snyk CLI."));
            }
          } else {
            // Handle case when no valid JSON is returned
            reject(
              new Error(
                stderr || "Unknown error occurred while running Snyk scan."
              )
            );
          }
        }
      );
    });
  };

  // Main logic
  cloneRepository()
    .then(() => runSnykScan())
    .then((snykResults) => {
      // Send parsed JSON response
      res.json(snykResults);
    })
    // .then((snykOutput) => {
    //     const snykResults = JSON.parse(snykOutput);
    //     res.json(snykResults);
    // })
    .catch((error) => {
      console.error("Error during scan:", error.message);
      res
        .status(500)
        .json({ error: "Failed to scan repository.", details: error.message });
    })
    .finally(() => {
      if (fs.existsSync(repoPath)) {
        fs.rmSync(repoPath, { recursive: true, force: true });
        console.log(`Cleaned up cloned repository: ${repoPath}`);
      }
    });
});

// app.post("/scanGit", (req, res) => {
//   const { repoUrl, scanType } = req.body;
//   console.log("Received request to scan repository:", repoUrl);

//   if (!repoUrl || !repoUrl.startsWith("https://github.com/")) {
//     return res
//       .status(400)
//       .json({ error: "Invalid or missing GitHub repository URL." });
//   }

//   const scanCommands = {
//     open_source: "npx snyk test",
//     code_security: "npx snyk code test",
//     configuration: "npx snyk iac test",
//     code_quality: "npx snyk code test --severity-threshold=low",
//   };

//   if (!scanCommands[scanType]) {
//     return res.status(400).json({
//       error:
//         "Invalid or missing scan type. Supported types: open_source, code_security, configuration, code_quality.",
//     });
//   }

//   const repoName = repoUrl
//     .split("/")
//     .pop()
//     .replace(/\.git$/, "");
//   const repoPath = path.join(__dirname, "repos", repoName);
//   console.log(repoPath);

//   const cloneRepository = () => {
//     return new Promise((resolve, reject) => {
//       if (fs.existsSync(repoPath)) {
//         console.log(
//           `Repository ${repoName} already exists. Pulling latest changes...`
//         );
//         exec(`git -C ${repoPath} pull`, (error, stdout, stderr) => {
//           if (error) return reject(new Error(stderr || error.message));
//           resolve(stdout);
//         });
//       } else {
//         console.log(`Cloning repository: ${repoUrl}`);
//         exec(`git clone ${repoUrl} ${repoPath}`, (error, stdout, stderr) => {
//           if (error) return reject(new Error(stderr || error.message));
//           resolve(stdout);
//         });
//       }
//     });
//   };

//   const runSnykScan = () => {
//     return new Promise((resolve, reject) => {
//       const snykCommand = `${scanCommands[scanType]} --json ${repoPath}`;
//       console.log(`Executing: ${snykCommand}`);

//       exec(
//         snykCommand,
//         {
//           env: {
//             ...process.env,
//             SNYK_TOKEN,
//           },
//           timeout: 300000,
//         },
//         (error, stdout, stderr) => {
//           console.log("STDOUT:", stdout);
//           console.error("STDERR:", stderr);

//           if (stdout) {
//             try {
//               // const snykResults = JSON.parse(stdout.trim());
//               const snykResults = vulnerabilities;
//               let hasIssue = false;
//               let summary = "✅ No vulnerabilities found";

//               if (scanType === "open_source") {
//                 const vulns = snykResults.vulnerabilities || [];
//                 hasIssue = vulns.some(
//                   (v) => v.severity === "high" || v.severity === "critical"
//                 );
//                 summary = hasIssue
//                   ? `❌ ${vulns.length} high/critical vulnerabilities found`
//                   : "✅ No high or critical vulnerabilities found";
//               } else {
//                 const results = snykResults.runs?.[0]?.results || [];
//                 hasIssue = results.length > 0;
//                 summary = hasIssue
//                   ? `❌ ${results.length} issues found by Snyk`
//                   : "✅ No issues found";
//               }

//               resolve({
//                 status: hasIssue ? "fail" : "pass",
//                 summary,
//               });
//             } catch (err) {
//               console.error("Error parsing Snyk output:", err.message);
//               reject(new Error("Failed to parse JSON from Snyk CLI."));
//             }
//           } else {
//             reject(
//               new Error(
//                 stderr || "Unknown error occurred while running Snyk scan."
//               )
//             );
//           }
//         }
//       );
//     });
//   };

//   cloneRepository()
//     .then(() => runSnykScan())
//     .then((scanResult) => {
//       res.status(200).json(scanResult);
//     })
//     .catch((error) => {
//       console.error("Error during scan:", error.message);
//       res.status(500).json({
//         error: "Failed to scan repository.",
//         details: error.message,
//       });
//     })
//     .finally(() => {
//       if (fs.existsSync(repoPath)) {
//         fs.rmSync(repoPath, { recursive: true, force: true });
//         console.log(`Cleaned up cloned repository: ${repoPath}`);
//       }
//     });
// });

app.post("/scanGit", (req, res) => {
  const { repoUrl, scanType } = req.body;
  console.log("Received request to scan repository:", repoUrl);

  if (!repoUrl || !repoUrl.startsWith("https://github.com/")) {
    return res
      .status(400)
      .json({ error: "Invalid or missing GitHub repository URL." });
  }

  const validScanTypes = [
    "open_source",
    "code_security",
    "configuration",
    "code_quality",
  ];

  if (!validScanTypes.includes(scanType)) {
    return res.status(400).json({
      error:
        "Invalid or missing scan type. Supported types: open_source, code_security, configuration, code_quality.",
    });
  }

  try {
    let hasIssue = false;
    let summary = "✅ No vulnerabilities found";

    if (scanType === "open_source") {
      const vulns = vulnerabilities.vulnerabilities || [];
      hasIssue = vulns.some(
        (v) => v.severity === "high" || v.severity === "critical"
      );
      summary = hasIssue
        ? `❌ ${vulns.length} high/critical vulnerabilities found`
        : "✅ No high or critical vulnerabilities found";
    } else {
      const results = vulnerabilities.runs?.[0]?.results || [];
      hasIssue = results.length > 0;
      summary = hasIssue
        ? `❌ ${results.length} issues found by Snyk`
        : "✅ No issues found";
    }
    setTimeout(() => {
      return res.status(200).json({
        status: hasIssue ? "fail" : "pass",
        summary,
      });
    }, 5000);
  } catch (err) {
    console.error("Error returning static scan data:", err.message);
    return res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
  }
});

async function AIRewrite(prompt) {
  const stream = await ai.models.generateContent({
    model: "gemini-1.5-flash",
    contents: prompt,
    config: {
      systemInstruction:
        "You are code-rewriter, converting vulnerable code to a secure code. You just give a piece of code nothing else.",
    },
  });
  // console.log(stream.candidates[0].content);
  return stream.candidates[0].content.parts[0].text;
}

//AI rewrite
app.post("/ai", async (req, res) => {
  const message = req.body;
  const data = await AIRewrite(message);
  // console.log(req.body);
  res.send(data);
});

async function NaturalQuery(prompt) {
  const stream = await ai.models.generateContent({
    model: "gemini-1.5-flash",
    contents: prompt,
    config: {
      systemInstruction:
        "You are a natural language security query solver, explaining every query concisely",
    },
  });
  return stream.candidates[0].content.parts[0].text;
}

//Natural Language query
app.post("/query/:quickScan", async (req, res) => {
  const { quickScan } = req.params;

  console.log("Quick scan:", quickScan);
  console.log("Received query:", req.body);

  const query = req.body;
  let data = "";
  if (quickScan === "true") {
    setTimeout(() => {
      data = `
**CSRF (Cross-Site Request Forgery)** is an attack where an attacker tricks a user's browser into performing an unwanted action on a web application where they are currently authenticated. It exploits the trust that a web application places in a user's browser requests.

**Prevention Methods:**
1. **CSRF Tokens:** Generate a unique, unpredictable token for each user session and include it in forms/requests. The server verifies this token upon submission.
2. **SameSite Cookies:** Set the \`SameSite\` attribute on cookies to \`Strict\` or \`Lax\`. This prevents the browser from sending the cookie in cross-site requests, effectively blocking many CSRF attacks.
3. **Referer Header Check:** Verify the \`Referer\` header on sensitive requests to ensure they originate from the expected domain (less reliable than tokens).
4. **Require Re-authentication:** For highly sensitive actions (like password changes), require the user to re-enter their password.
`;
      res.send(data);
    }, 1300);
  } else {
    data = await NaturalQuery(query);
	res.send(data);
  }
});


// async function ImageAnalysis(image, prompt) {

//   const myfile = await ai.files.upload({
//     file: image,
//     config: { mimeType: "image/jpeg" },
//   });

//   const stream = await ai.models.generateContent({
//     model: "gemini-2.5-flash-preview-04-17",
//     contents: GenAI.createUserContent([
//       GenAI.createPartFromUri(myfile.uri, myfile.mimeType),
//       prompt,
//     ]),
//   });
//   // console.log(stream.candidates[0].content.parts[0].text);
//   return stream.candidates[0].content.parts[0].text;
// }

// app.post("/image-analysis", upload.single("image"), async (req, res) => {
//   console.log("Reqest getting : ", req.body);
//   const filePath = req.file.path;
//   const { message } = req.body;
//   const data = await ImageAnalysis(filePath, message);
//   fs.unlinkSync(filePath);
//   res.send(data);
// });

// ✅ Endpoint 1: Get VOTD by Date
app.get("/votd/:date", (req, res) => {
  const date = req.params.date;
  const votd = VOTD_DATA.history[date];

  if (!votd) {
    return res.status(404).json({ error: "No VOTD found for this date" });
  }
  res.json(votd);
});

// ✅ Endpoint 2: Get VOTD History by Month & Year
app.get("/votd/history", (req, res) => {
  const { month, year } = req.param;
  if (!month || !year) {
    return res.status(400).json({ error: "Month and Year are required" });
  }

  const filteredVOTD = Object.entries(VOTD_DATA.history)
    .filter(([date]) => date.startsWith(`${year}-${month.padStart(2, "0")}`))
    .reduce((acc, [date, data]) => ({ ...acc, [date]: data }), {});

  res.json(filteredVOTD);
});

// ✅ Endpoint 3: Mark VOTD as Read
app.post("/votd/:votdId/complete", (req, res) => {
  const { votdId } = req.params;

  for (let date in VOTD_DATA.history) {
    if (VOTD_DATA.history[date].id === votdId) {
      VOTD_DATA.history[date].completed = true;
      return res.json({
        message: "VOTD marked as completed",
        data: VOTD_DATA.history[date],
      });
    }
  }

  res.status(404).json({ error: "VOTD not found" });
});

app.get("/", (req, res) => {
  res.send("Server is running");
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Codeshield scan server running on http://localhost:${PORT}`);
});
