# Output

## Table of Contents

- [Objective](#objective)
- [Cost Estimation](#cost-estimation)
- [Instructions for Use](#instructions)
- [Highlighting](#highlighting)
- [Notes](#notes)

## Objective

The objective of this tool is to efficiently estimate the cost of ownership for new materials required for each section. The accuracy of the estimation will vary based on the materials - items such as clothing where multiple sizes are listed may not be accurately calculated.

## Cost Estimation

- The tool reads an HEOA spreadsheet and totals the **cost of ownership for new materials**, per section, for all courses
- Materials may be textbooks or digital media, or any other supporting item
- The _highest_ cost of any given material is used. For example, if there are three options for the same book, the most expensive is used in case that is the only item available.
- If multiple versions of the same material are listed, the tool tries to identify them as such. If there are two books, _The Instruction Book_ and _Instruction Book_, the tool will consider them the same because the important words in the title are _Instruction_ and _Book_.
- It's assumed the price for rentals is less than purchase, if the highest cost option is a rental, in all likelihood, rental is the only option and it will be noted as such in the output

## Instructions For Use

### Spreadsheet selection

- If you have an HEOA spreadsheet, click **XLSX** and upload the file
- If you have FTP credentials for the HEOA feed, click **Get XLSX** and follow the instructions

### Viewing the spreadsheet

The **View** button shows a preview of the spreadsheet, whether you uploaded it or got it from the feed. The preview allows you to quickly check whether the file you're working with is the one you expected, it doesn't show all the data in the file.

### Downloading the estimated cost of materials

The **Download** button will deliver an Excel spreadsheet with the estimated cost of materials for all sections in the HEOA file. You may open it or download it.

## Highlighting

The spreadsheet can't be styled. Ref: <https://gist.github.com/SheetJSDev/24b8acd317d01999d721b38de7c53021>

You may use Excel's Conditional Formatting to highlight rows in the spreadsheet. These instructions describe how to emphasize the courses with an estimated material cost of less than \$40.

1. Select column D  
   ![Select column D](images/excel-hints-1.png)
1. Click on _Conditional Formatting_  
   ![Click Conditional Formatting](images/excel-hints-2.png)
1. Choose how you would like to highlight the estimated cost of materials  
   ![Choose Conditional Formatting](images/excel-hints-3.png)
1. Example display  
   ![Example display](images/excel-hints-4.png)

## Notes

Notes in the HEOA file are included in the output, they may be preceded by additional notes as follows:

1. _No text_ - no materials are listed for the section, which implies the cost of materials is zero
1. \*\*\*\* One or most of the materials is a CHOICE \*\*\*\* - the cost of materials cannot be estimated  
   because students have the option to choose between different materials. The total cost of materials will be \-\-\-.
1. RENTAL - if the materials are rental-only - the cost will be reported as _RENTAL_
