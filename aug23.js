const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const csvParser = require("csv-parser");


let allDataExtract = [];  

(async () => {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({ timeout: 60000 });

    const page = await context.newPage();

    console.log("script is running...");

    async function wait(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

   
async function clearButton() { 
    await page.evaluate(() => {
        const labels = document.querySelectorAll('label');
    
        for (let label of labels) {
            if (label.innerText === 'Near') {
                console.log('Found "Near" label.');

                const parentDiv = label.parentElement;

                if (parentDiv) {
                    console.log('Found parent div.');
                    const button = parentDiv.querySelector('button');
                    if (button) {
                        button.click();
                        console.log('Button clicked.');
                    } else {
                        console.log('Button not found.');
                    }
                } else {
                    console.log('Parent div not found.');
                }
                return;
            }
        }
        console.log('"Near" label not found in the DOM.');
    });
}



    async function handleOnFocus() {
        await page.evaluate(() => {
      
        const labels = document.querySelectorAll('label');
        let findCount = 0;

       
        for (let label of labels) {
            if (label.innerText.trim() === 'Find') {
                findCount++;

                
                if (findCount === 2) {
                    console.log('Found second "Find" label.');
                    const siblingDiv = label.nextElementSibling;
                    console.log(siblingDiv, "siblingDiv");

                    if (siblingDiv) {
                        const input = siblingDiv.querySelector('input[name="find_text"]');
                        console.log(input, 'input');

                        if (input) {
                            input.focus();
                            console.log('Input field focused.');

                        } else {
                            console.log('Input not found.');
                        }
                    } else {
                        console.log('Sibling div not found.');
                    }
                    return; 
                }
            }
        }
        console.log('"Find" label not found in the DOM.');
    })
    }

   
    
    async function handleSetValueInInputField(companyName) {
        await page.evaluate((companyName) => {
            const labels = document.querySelectorAll('label');
            let findCount = 0;
    
            for (let label of labels) {
                if (label.innerText.trim() === 'Find') {
                    findCount++;
                    console.log("label id", label.id);
                    let inputID = document.getElementById(label.id).htmlFor;
    
                    console.log("inputID", inputID);
    
                    if (findCount === 2) {
                        console.log('Found second "Find" label.');
                        const siblingDiv = label.nextElementSibling;
    
                        if (siblingDiv) {
                            const input = siblingDiv.querySelector('input[name="find_text"]');
                            if (input) {
                                input.focus();  
                                const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
                                nativeInputValueSetter.call(input, companyName);
                                input.dispatchEvent(new Event('input', { bubbles: true }));
                                input.dispatchEvent(new Event('change', { bubbles: true }));
    
                                console.log(`Typed "${companyName}" into the input field`);
                            } else {
                                console.log("Input field not found");
                            }
                        } else {
                            console.log('Sibling div not found.');
                        }
                        return; 
                    }
                }
            }
            console.log('"Find" label not found in the DOM.');
        }, companyName);  
    }
    



    async function handleSearchButton() {
        await page.evaluate(() => {
            const buttons = document.querySelectorAll('button');
            let searchButtonFound = false;
    
            for (let button of buttons) {
                if (button.innerText.trim() === 'Search') {
                    searchButtonFound = true;
                    button.click();
                    console.log('Search button clicked');
                    break;
                }
            }
    
            if (!searchButtonFound) {
                console.log('Search button not found');
            }
        });
    }
    
    

    // if serach result not found so there for this below functon is created.
    async function itemNotFound() {
        const noResultsSelector = 'h1';
    
        try {
            await page.waitForSelector(noResultsSelector, { timeout: 10000 });
            const noResultsElement = await page.$(noResultsSelector);
    
            if (noResultsElement) {
                const firstSpanElement = await noResultsElement.$('span:first-child');
                const textContent = await firstSpanElement.evaluate(node => node.textContent.trim());
    
                if (textContent === "We're sorry, we found no results for") {
                    console.log("Item not found");
                    return true;
                }
            }
        } catch (error) {
            console.error("Error checking for no results:", error);
        }
    
        return false;
    }

   
    

    // this below Find Pincode function
    // async function handleFindCode(addrss) {
        
    //    // Extract pincode values from p elements with translate="no"
    //    const findAddPincode = await page.evaluate(() => {
    //     const pElements = document.querySelectorAll('p[translate="no"]');
    //     return Array.from(pElements).map(p => p.textContent.trim());
    // });

    // console.log("Website pincode:", findAddPincode);

    // let found = false;

    //     while (!found) {
           
    //         for (const pincodeValue of findAddPincode) {
    //             console.log(":::::::AZJS:::::web:::::::", pincodeValue);
    //             if (pincodeValue.includes(addrss)) {
    //                 console.log("Pincode found:", pincodeValue);
    //                 found = true;
    
    //                 await wait(2000);
    //                 await handleClickItem();
    //                 await wait(2000);
    //                 await handleReadmoreDetails();
    //                 await wait(2000);
    //                 await extractBusinessDetails();
    //                 break;
    //             }
    //         }

    //         if (!found) {

    //             const nextPageSelector = 'a[rel="next"]';
    //             const nextPageElement = await page.$(nextPageSelector);

    //             if (nextPageElement) {
    //                 await wait(2000)
    //                 await nextPageElement.click();
    //                 console.log("Next button clicked");
    //                 await page.waitForTimeout(6000); 
    //                 console.log("Rechecking for pincode on the new page...");
    //             } else {
    //                 console.log("No more pages. Pincode not found.");
    //                 break;
    //             }
    //         }
    //     }
    // }

    async function handleFindCode(addrss,mobileNumber) {
        console.log("handleFindCode::::: ", addrss);
    
       
        let findAddPincode = await page.evaluate(() => {
            const pElements = document.querySelectorAll('p[translate="no"]');
            return Array.from(pElements).map(p => p.textContent.trim());
        });
    
        console.log("Website pincode:", findAddPincode);
    
        let found = false;
    
        while (!found) {
            // Check if any pincode includes the address
            for (const pincodeValue of findAddPincode) {
                console.log(":::::::AZJS:::::web:::::::", pincodeValue);
                if (pincodeValue.includes(addrss)) {
                    console.log("Pincode found:", pincodeValue);
                    found = true;
    
                    await wait(2000);
                    await handleClickItem(pincodeValue,mobileNumber);
                    await wait(8000);
                    await handleReadmoreDetails();
                    await wait(8000);
                    await extractBusinessDetails();
                    break;
                }
            }
    
            if (!found) {
                const nextPageSelector = 'a[rel="next"]';
                const nextPageElement = await page.$(nextPageSelector);
    
                if (nextPageElement) {
                    await wait(2000);
                    await nextPageElement.click();
                    console.log("Next button clicked");
                    await page.waitForTimeout(6000);
    
                    // Re-fetch the pincode values on the new page
                    findAddPincode = await page.evaluate(() => {
                        const pElements = document.querySelectorAll('p[translate="no"]');
                        return Array.from(pElements).map(p => p.textContent.trim());
                    });
    
                    console.log("Website pincode after clicking next:", findAddPincode);
                    console.log("Rechecking for pincode on the new page...");
                } else {
                    console.log("No more pages. Pincode not found.");
                    break;
                }
            }
        }
    }
    
    
// _______________start__code___________________i will come again on the functions_________________________


// today 23Augest code start___________
async function handleClickItem(pincodeValue,mobileNumber) {
    console.log("Received pincode value:", pincodeValue);

    
    console.log('Recevide mobile Number or not ?::::',mobileNumber)

    // Select all `p` elements that contain an `a` tag
    // let arr=[]
const pElementsWitha = await page.$$('p');
let linkText="";
// Loop through each `p` element found
for (const pElement of pElementsWitha) {
    // Get the `a` element inside the current `p` element
    const aElement = await pElement.$('a');
    
    if (aElement) {
        // If the `a` element exists, get its text content
         linkText = await aElement.textContent();
        //  arr.push(linkText)
        console.log("Link text:", linkText);
    }
}




// __________________azcode
// Normalize phone numbers and collect them in an array
// const normalizedNumbers = arr
//   .filter(item => item.includes('(')) // Filter out non-phone entries
//   .map(linkText => linkText.replace(/[()\s-]/g, '')); // Normalize phone numbers

// // Print each normalized phone number
// normalizedNumbers.forEach(normalizedLinkText => {
//   console.log(normalizedLinkText, "linkS");
// });

// // Check if the normalized mobile number is included
// const normalizedMobileNumber = mobileNumber.replace(/[()\s-]/g, '');
// const isIncluded = normalizedNumbers.includes(normalizedMobileNumber);

// console.log(isIncluded, "d"); // Output: true or false
// ___________________azcode

// console.log(linkText.includes(mobileNumber))
// // console.log(linkText.replace(/\D/g, '').includes(mobileNumber.replace(/\D/g, '')));
// console.log(linkText.endsWith(mobileNumber.slice(-6)));

// let normalizedLinkText = linkText.replace(/[()\s-]/g, '');

// console.log(normalizedLinkText,"linkS")

// const allNumberData= arry.forEach(linkText => {
//     let normalizedLinkText = linkText.replace(/[()\s-]/g, '');
//     console.log(normalizedLinkText, "linkS");
// });

// console.log(allNumberData,"d")

// Normalize the mobile number by removing everything before the last space
// let normalizedMobileNumber = mobileNumber.replace(/^.*\s/, '').replace(/-/g, '');

// console.log(normalizedMobileNumber,"mobile:::")
// console.log(normalizedLinkText.includes(normalizedLinkText))

// const comparisonResult = normalizedMobileNumber.includes(normalizedLinkText);

// console.log(comparisonResult,":::::::AZJS")

    const pElements = await page.$$('p[translate="no"]');


    let targetAnchor = null;

    for (const pElement of pElements) {
        const textContent = await pElement.textContent();

       
        if (textContent && textContent.trim() === pincodeValue) {
           
            const anchorHandle = await pElement.evaluateHandle((p) => {
                
                const grandParentDiv = p.closest('div').parentElement.parentElement;
                const previousSiblingDiv = grandParentDiv.previousElementSibling;
                if (previousSiblingDiv) {
                    return previousSiblingDiv.querySelector('h3 > a');
                }
                return null;
            });

            
            targetAnchor = anchorHandle ? anchorHandle.asElement() : null;

            
            if (targetAnchor) break;
        }
    }

    
    if (targetAnchor) {
        await targetAnchor.click();
        console.log("Clicked specific item");
    } else {
        console.log("Specific item not found");
    }
}



// today 23Augest code end_______________

// async function handleClickItem(pincodeValue) {

//     console.log("come pincode Value in handleClickItem :::><<<<",pincodeValue)

//     // azjs

//     let findAddPincode = await page.evaluate(() => {
//         const pElements = document.querySelectorAll('p[translate="no"]');
//         return Array.from(pElements).map(p => p.textContent.trim());
//     });

//     console.log("Website pincode:", findAddPincode);
    
//     // azjs



//     const items = "h3 > a";
//     const item = await page.$(item && findAddPincode);
//     if (item) {
//         await item.click();
//         console.log("Clicked specific item");
//     } else {
//         console.log("Specific item not found");
//     }
// }



    // async function handleClickItem(findedValue) {
    //     const itemSelectot = "a.text-blue-medium.css-1jw2l11.eou9tt70";
    //     const item = await page.$(itemSelectot);
    //     if (item) {
    //         await item.click();
    //         console.log("Clicked specific item");
    //     } else {
    //         console.log("Specific item not found");
    //     }
    // }

    // whare is the found the pincode the so then find exist closet h3 >a and then click the.
    
    // async function handleClickItem(pincode) {
    //     const itemSelector = "a.text-blue-medium.css-1jw2l11.eou9tt70";
    
    //     // Find all items matching the selector
    //     const items = await page.$$(itemSelector);
    
    //     for (const item of items) {
    //         const itemText = await page.evaluate(el => el.textContent.trim(), item);
    
    //         // Check if the item's text contains the pincode
    //         if (itemText.includes(pincode)) {
    //             console.log("check item parent div step::::::::::::::::::",items)
    //             await item.click();
    //             console.log("Clicked specific item containing pincode:", pincode);
    //             return;
    //         }
    //     }
    
    //     console.log("Specific item containing pincode not found");
    // }
    

    // async function handleClickItem(pincode) {

    //     console.log("companyName is exists  done:",companyName)
        
    //     const pElements = await page.$$('p[translate="no"]');
    
    //     for (const pElement of pElements) {
        
    //         const pText = await page.evaluate(el => el.textContent.trim(), pElement);
    
        
    //         if (pText.includes(pincode)) {
        
    //             const closestLink = await page.evaluateHandle(el => {
    
    //                 const closestAnchor = el.closest('div').querySelector('h3 > a');
    //                 return closestAnchor;
    //             }, pElement);
        
    
    //             if (closestLink) {
    //                 console.log("Found and clicked on the closest h3 > a tag");
    //                 await closestLink.click();
    //                 return;
    //             }
    //         }
    //     }
    
    //     console.log("Specific item containing pincode or closest h3 > a tag not found");
    // }
    
    // null error solved.

    
    // async function handleClickItem(pincode) {
    // const companyName = "two-brothers-roofing";

    // console.log("Checking for companyName:", companyName);
    
    // const pElements = await page.$$('p[translate="no"]');

    // for (const pElement of pElements) {
    //     const pText = await page.evaluate(el => el.textContent.trim(), pElement);

    //     if (pText.includes(pincode)) {
    //         const closestLink = await page.evaluateHandle(el => {
    //             const closestAnchor = el.closest('div')?.querySelector('h3 > a');
    //             return closestAnchor || null;
    //         }, pElement);

    //         if (closestLink) {
    //             const linkText = await page.evaluate(el => el?.textContent?.trim().toLowerCase(), closestLink);
    //             const normalizedCompanyName = companyName.toLowerCase();

    //             if (linkText && linkText.includes(normalizedCompanyName)) {
    //                 console.log("Found and clicked on the link with companyName:", companyName);
    //                 await closestLink.click();
    //                 return;
    //             }
    //         } else {
    //             console.log("No closest h3 > a tag found.");
    //         }
    //     }
    // }

    // console.log("Specific item containing pincode or closest h3 > a tag with companyName not found");
    //    }
              
// _______________end_code_____________________i will come again on this functions_________________________
    

    async function handleReadmoreDetails() {
        try {
            const readMoreLink = await page.evaluateHandle(() => {
                return Array.from(document.querySelectorAll('a')).find(a => 
                    a.textContent.trim() === "Read More Business Details and See Alerts"
                );
            });
    
            if (readMoreLink) {
                console.log("Found 'Read More Business Details' link. Clicking...");
                await readMoreLink.click();
                console.log("Clicked 'Read More Business Details' link.");
            } else {
                console.error("'Read More Business Details' link not found.");
            }
    
            //Cleans up the handle after use.there i  have used to dispose().
            await readMoreLink.dispose();
        } catch (error) {
            console.error("Error finding or clicking 'Read More Business Details' link:", error);
        }
    }
    


    async function extractBusinessDetails() {
     
        const details = {
            businessName: await getBusinessName(),
            ownerName: await getOwnerName(),
        };
        console.log("Extracted Details:", details);
        allDataExtract.push(details);

    }


  // ______________________________________________

 // get Business name or get CSV Company Name

    async function getBusinessName() {
        try {
            // Find the h1 tag that contains the span with the specific text
            const businessNameElement = await page.evaluateHandle(() => {
                const h1 = Array.from(document.querySelectorAll('h1')).find(h1 => {
                    const span = Array.from(h1.querySelectorAll('span')).find(span => 
                        span.textContent.trim() === "Additional Information for"
                    );
                    return !!span; // If the span is found, return the h1 element
                });
    
                if (h1) {
                    // Remove the span element from the h1 to get only the business name
                    h1.querySelector('span').remove();
                    return h1;
                }
                return null;
            });

            // console.log("business Name::::::: ",businessNameElement )
            // console.log("h1",h1 )
    
            if (businessNameElement) {
                // Get the remaining text content of the h1 tag (the business name)
                const businessName = await page.evaluate(el => el.textContent.trim(), businessNameElement);
                console.log("Business Name:", businessName);
    
                // Dispose of the element handle to free up resources
                await businessNameElement.dispose();

                return businessName;

            } else {
                console.error("'Additional Information for' not found in any h1 tag.");
                return null
            }
    
        } catch (error) {
            console.error("Error finding the business name:", error);
            return null
        }
    }
    



    

  //__________________________________________________________
    async function getOwnerName() {
        const infoElements = await page.$$("dd > ul > li > span");
        const ownersSet = new Set();
        const nonOwnersSet = new Set();

        for (const element of infoElements) {
            const text = (await element.textContent()).trim();
            if (text.includes("Owner")) {
                ownersSet.add(text);
            } else {
                nonOwnersSet.add(text);
            }
        }

        return {
            owners: Array.from(ownersSet).join(" || ")
                ? Array.from(ownersSet).join(" || ")
                : "-",
            nonOwners: Array.from(nonOwnersSet).join(" || ")
                ? Array.from(nonOwnersSet).join(" || ")
                : "-",
        };
    }

   
    // async function getOwnerName() {
    //     try {
    //         const businessManagementText = "Business Management";
    //         const contactInformationText = "Contact Information";
    
    //         const result = await page.evaluate((businessManagementText, contactInformationText) => {
    //             let businessManagementValue = null;
    //             let contactInformationValue = null;
    //             let contactInformationCount = 0;
    
    //             // Traverse all the <dt> elements in the document
    //             const allDtElements = Array.from(document.querySelectorAll('dt'));
    
    //             for (let dt of allDtElements) {
    //                 const dtText = dt.textContent.trim();
    
    //                 // Find "Business Management" (only one occurrence in the whole DOM)
    //                 if (dtText === businessManagementText) {
    //                     const nextSibling = dt.nextElementSibling;
    //                     if (nextSibling) {
    //                         const spanElement = nextSibling.querySelector('ul > li > span');
    //                         if (spanElement) {
    //                             businessManagementValue = spanElement.textContent.trim();
    //                         }
    //                     }
    //                 }
    
    //                 // Find "Contact Information" (third occurrence)
    //                 if (dtText === contactInformationText) {
    //                     contactInformationCount++;
    //                     if (contactInformationCount === 3) {
    //                         const nextSibling = dt.nextElementSibling;
    //                         if (nextSibling) {
    //                             const spanElement = nextSibling.querySelector('ul > li > span');
    //                             if (spanElement) {
    //                                 contactInformationValue = spanElement.textContent.trim();
    //                             }
    //                         }
    //                     }
    //                 }
    
    //                 // Exit the loop early if both values are found
    //                 if (businessManagementValue && contactInformationValue) {
    //                     break;
    //                 }
    //             }
    
    //             return {
    //                 businessManagementValue,
    //                 contactInformationValue
    //             };
    //         }, businessManagementText, contactInformationText);
    
    //         if (result.businessManagementValue) {
    //             console.log("Business Management Value:", result.businessManagementValue);
    //         } else {
    //             console.log("'Business Management' text not found in the DOM.");
    //         }
    
    //         if (result.contactInformationValue) {
    //             console.log("Third Contact Information Value:", result.contactInformationValue);
    //         } else {
    //             console.log("Third 'Contact Information' text not found in the DOM.");
    //         }
    
    //         return {
    //             businessManagementValue: result.businessManagementValue || undefined,
    //             contactInformationValue: result.contactInformationValue || undefined
    //         };
    //     } catch (error) {
    //         console.error("Error finding the owner names:", error);
    //         return { businessManagementValue: undefined, contactInformationValue: undefined };
    //     }
    // }
    
  
   
    
  
    



    async function jsonToCSV(data) {
        const headers = ["BusinessName", "Owners", "NonOwners"];
        const rows = [headers.join(",")];

        data.forEach((item) => {
            const row = [
                `"${item?.businessName?.replace(/"/g, '""')}"`,
                `"${item?.ownerName?.owners.replace(/"/g, '""')}"`,
                `"${item?.ownerName?.nonOwners.replace(/"/g, '""')}"`,
            ].join(",");

            rows.push(row);
        });

        return rows.join("\n");
    }



    function readCSV(filePath) {
        return new Promise((resolve, reject) => {
            const results = [];
            fs.createReadStream(filePath)
                .pipe(csvParser())
                .on("data", (data) => results.push(data))
                .on("end", () => resolve(results))
                .on("error", (error) => reject(error));
        });
    }

   let companyName='';
   let mobileNumber='';
//    console.log("check is mobile number is ther or not ",mobileNumber)

    async function main() {
        const companies = await readCSV(
            path.join(__dirname, "business_details.csv")
        );
        const processedCompanies = [];

        for (let i = 0; i < companies.length; i++) {
            const company = companies[i];
             companyName = company["Company Name"];
            const addrss = company["Address"];
             mobileNumber = company["Contact Details"];
          console.log("aaaNumber",mobileNumber)



            if (!addrss || addrss.trim() === "") {
                console.log(
                    `Skipping company with null or empty address: ${companyName}`
                );
                
            
                continue;
            }

            const addressNumber = addrss.split(" ")[0]; 

            await page.goto("https://www.bbb.org/", { timeout: 60000 });
            await wait(2000);
            await clearButton();
            await wait(2000);
            await handleOnFocus();
            await wait(2000);
            await handleSetValueInInputField(companyName);
            await wait(2000);
             await handleSearchButton();
            await wait(5000); 

            const noResults = await itemNotFound();
            if (noResults) {
                console.log(
                    `Skipping company ${companyName} as no results were found.`
                );
                continue;
            }

            await handleFindCode(addressNumber,mobileNumber);

            processedCompanies.push(companyName);

            if (i === companies.length - 1) {
                console.log("Last company name done. Details extraction done.");
                console.log("Processed Companies:", processedCompanies);
               const csvData = await jsonToCSV(allDataExtract);
           
            fs.writeFileSync(path.join(__dirname, (() => { let i = 1; while (fs.existsSync(path.join(__dirname, `dataBBB(${i}).csv`))) i++; return `dataBBB(${i}).csv`; })()), csvData, 'utf-8');

               console.log("CSV file saved as dataBBB.csv");
             await browser.close();
            }
        }
    }

    await main();
})();


