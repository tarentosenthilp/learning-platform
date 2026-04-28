-- ─── Module 12: Introduction to SAP and the ABAP Environment ───

INSERT INTO lessons (module_id, title, content, position, duration_minutes, created_at) VALUES
(12, 'What is SAP and Where Does ABAP Fit?',
'## What is SAP?

SAP (Systems, Applications and Products) is the world''s leading ERP platform, used by companies across manufacturing, retail, finance, logistics, and more.

### The SAP Technology Stack

- **SAP BASIS** — the infrastructure layer (OS, DB, application server)
- **ABAP** — the programming language for customization and development
- **SAP Fiori / UI5** — the modern UI layer
- **SAP HANA** — the in-memory database platform

### What is ABAP?

ABAP (Advanced Business Application Programming) is a high-level, interpreted language created by SAP in the 1980s. It is still the primary language for:
- Custom reports and data extracts
- User exits, BADIs, and enhancement spots
- Custom transactions and background jobs',
1, 12, datetime('now', '-20 days'));

INSERT INTO lessons (module_id, title, content, position, duration_minutes, created_at) VALUES
(12, 'Navigating the SAP GUI and ABAP Workbench',
'## The SAP GUI

The SAP GUI is the desktop client used to interact with an SAP system.

### Key T-codes for ABAP Developers

| T-code | Purpose |
|---|---|
| SE38 | ABAP Editor — create and edit programs |
| SE80 | Object Navigator — browse all development objects |
| SE11 | ABAP Dictionary — view and edit table definitions |
| SE37 | Function Builder — create and test function modules |
| SE24 | Class Builder — create and manage ABAP classes |
| SM37 | Background Job Monitor |
| ST05 | SQL Trace — debug database queries |',
2, 15, datetime('now', '-20 days'));

INSERT INTO lessons (module_id, title, content, position, duration_minutes, created_at) VALUES
(12, 'Creating Your First ABAP Program',
'## Writing Hello World in ABAP

Every ABAP program starts with a REPORT statement followed by the program logic.

    REPORT z_hello_world.
    WRITE ''Hello, SAP World!''.

### Program Structure

    REPORT z_my_first_program.

    DATA lv_message TYPE string.
    lv_message = ''Welcome to ABAP''.
    WRITE lv_message.

### ABAP Naming Conventions

- Programs start with Z or Y (customer namespace)
- Local variables: lv_ prefix
- Global variables: gv_ prefix
- Structures: ls_ / gs_ prefix
- Internal tables: lt_ / gt_ prefix',
3, 18, datetime('now', '-20 days'));

INSERT INTO lessons (module_id, title, content, position, duration_minutes, created_at) VALUES
(12, 'The ABAP Dictionary (SE11) — Tables and Data Elements',
'## ABAP Dictionary Overview

The ABAP Dictionary (SE11) is the central metadata repository for all data objects in SAP — tables, views, data elements, domains, and structures.

### Common SAP Tables Every ABAP Developer Must Know

| Table | Content |
|---|---|
| MARA | General material data |
| KNA1 | Customer master |
| LFA1 | Vendor master |
| VBAK | Sales order header |
| BKPF | Accounting document header |
| USR02 | User login data |

### Viewing Table Structure

Open SE11, enter table name, then Display. You will see field names, key fields, and technical settings.',
4, 14, datetime('now', '-19 days'));

-- ─── Module 13: ABAP Language Fundamentals ───

INSERT INTO lessons (module_id, title, content, position, duration_minutes, created_at) VALUES
(13, 'Data Types, Variables, and Constants',
'## Elementary Data Types in ABAP

ABAP has a rich set of built-in data types:

| Type | Description | Example |
|---|---|---|
| I | Integer | DATA lv_count TYPE i. |
| F | Floating point | DATA lv_rate TYPE f. |
| C | Character (fixed length) | DATA lv_name TYPE c LENGTH 30. |
| N | Numeric string | DATA lv_matnr TYPE n LENGTH 18. |
| D | Date (YYYYMMDD) | DATA lv_date TYPE d. |
| T | Time (HHMMSS) | DATA lv_time TYPE t. |
| STRING | Variable-length string | DATA lv_text TYPE string. |
| P | Packed decimal | DATA lv_amount TYPE p DECIMALS 2. |

### Dictionary-Based Types

Always prefer dictionary-based typing over raw types for compatibility:

    DATA lv_material TYPE mara-matnr.
    DATA lv_customer TYPE kna1-kunnr.',
1, 16, datetime('now', '-18 days'));

INSERT INTO lessons (module_id, title, content, position, duration_minutes, created_at) VALUES
(13, 'Control Structures — IF, CASE, LOOP, DO, WHILE',
'## Conditional Logic

    IF lv_score >= 90.
      WRITE ''Grade: A''.
    ELSEIF lv_score >= 75.
      WRITE ''Grade: B''.
    ELSE.
      WRITE ''Grade: C''.
    ENDIF.

### CASE Statement

    CASE lv_status.
      WHEN ''A''.
        WRITE ''Active''.
      WHEN ''I''.
        WRITE ''Inactive''.
      WHEN OTHERS.
        WRITE ''Unknown''.
    ENDCASE.

### Loops

    DO 5 TIMES.
      WRITE sy-index.
    ENDDO.

    WHILE lv_counter < 10.
      lv_counter = lv_counter + 1.
    ENDWHILE.',
2, 14, datetime('now', '-18 days'));

INSERT INTO lessons (module_id, title, content, position, duration_minutes, created_at) VALUES
(13, 'String Operations and Formatting Output',
'## Working with Strings

    DATA lv_first TYPE string VALUE ''SAP''.
    DATA lv_second TYPE string VALUE ''ABAP''.
    DATA lv_result TYPE string.

    CONCATENATE lv_first '' '' lv_second INTO lv_result.
    " Result: ''SAP ABAP''

    lv_result = lv_first && '' '' && lv_second.  " Modern syntax

### String Functions

    DATA(lv_length) = strlen( lv_result ).
    DATA(lv_upper)  = to_upper( lv_result ).
    DATA(lv_lower)  = to_lower( lv_result ).

### Formatted Output with WRITE

    WRITE: / ''Material:'', lv_matnr,
           / ''Quantity:'', lv_qty,
           / ''Date:'',     sy-datum.

The slash (/) forces a new line. sy-datum is the system date.',
3, 13, datetime('now', '-17 days'));

INSERT INTO lessons (module_id, title, content, position, duration_minutes, created_at) VALUES
(13, 'Structures and Work Areas',
'## Structures in ABAP

A structure is a composite data type — a group of fields treated as one unit (like a row of a database table).

### Declaring a Structure

    DATA ls_customer TYPE kna1.        " Structure based on table KNA1
    ls_customer-kunnr = ''0000001000''. " Access field with hyphen
    ls_customer-name1 = ''Acme Corp''.

### Defining a Custom Structure

    TYPES: BEGIN OF ty_employee,
             emp_id   TYPE i,
             name     TYPE string,
             salary   TYPE p DECIMALS 2,
           END OF ty_employee.

    DATA ls_employee TYPE ty_employee.
    ls_employee-emp_id = 1001.
    ls_employee-name   = ''John Smith''.

### The Work Area Pattern

When reading from the database, you always read INTO a structure (the work area):

    SELECT SINGLE * FROM mara INTO ls_mara
      WHERE matnr = lv_material.',
4, 15, datetime('now', '-17 days'));

-- ─── Module 14: Database Programming with Open SQL ───

INSERT INTO lessons (module_id, title, content, position, duration_minutes, created_at) VALUES
(14, 'Open SQL Basics — SELECT Statements',
'## Open SQL

Open SQL is ABAP''s database-independent SQL layer. It translates to the underlying database (HANA, Oracle, SQL Server) automatically.

### SELECT SINGLE — Fetch One Row

    DATA ls_customer TYPE kna1.

    SELECT SINGLE kunnr name1 land1
      FROM kna1
      INTO CORRESPONDING FIELDS OF ls_customer
      WHERE kunnr = ''0000001000''.

    IF sy-subrc = 0.
      WRITE ls_customer-name1.
    ELSE.
      WRITE ''Customer not found''.
    ENDIF.

### sy-subrc — The Return Code

After every SELECT, check sy-subrc:
- 0 = rows found
- 4 = no rows found

### SELECT INTO TABLE — Fetch Multiple Rows

    DATA lt_customers TYPE TABLE OF kna1.

    SELECT kunnr name1 land1
      FROM kna1
      INTO TABLE lt_customers
      WHERE land1 = ''US''.

    WRITE: / ''Found:'', sy-dbcnt, ''customers''.',
1, 20, datetime('now', '-15 days'));

INSERT INTO lessons (module_id, title, content, position, duration_minutes, created_at) VALUES
(14, 'JOINs, Aggregate Functions, and Subqueries',
'## Joining Tables in Open SQL

    SELECT v~vbeln v~kunnr k~name1
      FROM vbak AS v
      INNER JOIN kna1 AS k ON v~kunnr = k~kunnr
      INTO TABLE @DATA(lt_orders)
      WHERE v~audat >= @lv_date_from.

### Aggregate Functions

    SELECT COUNT(*) FROM vbak
      INTO lv_order_count
      WHERE audat = sy-datum.

    SELECT matnr SUM( labst ) AS total_stock
      FROM mard
      INTO TABLE @DATA(lt_stock)
      GROUP BY matnr
      HAVING SUM( labst ) > 0.

### Modern ABAP 7.40+ Inline Declarations

    SELECT matnr maktx
      FROM makt
      INTO TABLE @DATA(lt_desc)
      WHERE spras = ''EN''.

The @DATA() inline declaration creates the table automatically — no need to declare lt_desc first.',
2, 18, datetime('now', '-14 days'));

INSERT INTO lessons (module_id, title, content, position, duration_minutes, created_at) VALUES
(14, 'INSERT, UPDATE, DELETE and Database Commits',
'## Modifying Database Records

### INSERT

    DATA ls_ztable TYPE zmy_custom_table.
    ls_ztable-id     = ''001''.
    ls_ztable-name   = ''Test Record''.
    ls_ztable-status = ''A''.

    INSERT zmy_custom_table FROM ls_ztable.
    IF sy-subrc <> 0.
      MESSAGE ''Insert failed'' TYPE ''E''.
    ENDIF.

### UPDATE

    UPDATE zmy_custom_table SET status = ''I''
      WHERE id = ''001''.

### DELETE

    DELETE FROM zmy_custom_table WHERE status = ''I''.

### MODIFY (INSERT or UPDATE)

    MODIFY zmy_custom_table FROM ls_ztable.

### Database Commits

ABAP does NOT auto-commit. You must explicitly commit:

    COMMIT WORK.         " Commit all changes
    ROLLBACK WORK.       " Undo all uncommitted changes

Best practice: never COMMIT inside a loop.',
3, 16, datetime('now', '-14 days'));

-- ─── Module 15: Internal Tables and Data Processing ───

INSERT INTO lessons (module_id, title, content, position, duration_minutes, created_at) VALUES
(15, 'Internal Tables — Types, Declaration, and Population',
'## What Are Internal Tables?

Internal tables are temporary, in-memory tables that exist only during program execution. They are the single most important concept in ABAP — used to hold dataset results, process data in batches, and pass data between modules.

### Three Types of Internal Tables

| Type | Key | Use Case |
|---|---|---|
| STANDARD TABLE | None (array) | Sequential processing, LOOP AT |
| SORTED TABLE | Defined key, always sorted | Binary search, READ TABLE |
| HASHED TABLE | Unique hash key | Fast single-record lookup |

### Declaration

    TYPES: ty_customers TYPE TABLE OF kna1.
    DATA: lt_customers TYPE TABLE OF kna1,
          ls_customer  TYPE kna1.

### Populating Internal Tables

    " From database
    SELECT * FROM kna1 INTO TABLE lt_customers WHERE land1 = ''DE''.

    " Manually with APPEND
    ls_customer-kunnr = ''9999''.
    ls_customer-name1 = ''Test''.
    APPEND ls_customer TO lt_customers.

    " Inline with VALUE
    DATA(lt_numbers) = VALUE int4_table( ( 1 ) ( 2 ) ( 3 ) ).',
1, 22, datetime('now', '-12 days'));

INSERT INTO lessons (module_id, title, content, position, duration_minutes, created_at) VALUES
(15, 'LOOP AT, READ TABLE, and Table Expressions',
'## Looping Over Internal Tables

    LOOP AT lt_customers INTO ls_customer.
      WRITE: / ls_customer-kunnr, ls_customer-name1.
    ENDLOOP.

### Filtering in the Loop

    LOOP AT lt_customers INTO ls_customer WHERE land1 = ''US''.
      WRITE ls_customer-name1.
    ENDLOOP.

### READ TABLE — Find a Specific Row

    READ TABLE lt_customers INTO ls_customer
      WITH KEY kunnr = ''0000001000''.
    IF sy-subrc = 0.
      WRITE ls_customer-name1.
    ENDIF.

### Modern Table Expressions (ABAP 7.40+)

    " Read directly without a work area
    DATA(ls_found) = lt_customers[ kunnr = ''0000001000'' ].

    " Check existence
    IF line_exists( lt_customers[ kunnr = ''0000001000'' ] ).
      WRITE ''Found''.
    ENDIF.

    " Get count
    DATA(lv_count) = lines( lt_customers ).',
2, 20, datetime('now', '-11 days'));

INSERT INTO lessons (module_id, title, content, position, duration_minutes, created_at) VALUES
(15, 'Sorting, Deleting Duplicates, and Collecting',
'## Sorting Internal Tables

    SORT lt_customers BY land1 name1.
    SORT lt_customers BY kunnr DESCENDING.

### Deleting Rows

    " Delete a specific row by key
    DELETE lt_customers WHERE land1 = ''XX''.

    " Delete the current row inside a LOOP
    LOOP AT lt_customers INTO ls_customer.
      IF ls_customer-name1 IS INITIAL.
        DELETE lt_customers.
      ENDIF.
    ENDLOOP.

### Removing Duplicates

    SORT lt_customers BY land1.
    DELETE ADJACENT DUPLICATES FROM lt_customers COMPARING land1.

### COLLECT — Aggregate by Key

COLLECT sums numeric fields for rows with the same key:

    TYPES: BEGIN OF ty_summary,
             land1 TYPE kna1-land1,
             count TYPE i,
           END OF ty_summary.

    DATA lt_summary TYPE TABLE OF ty_summary.
    DATA ls_summary TYPE ty_summary.

    LOOP AT lt_customers INTO ls_customer.
      ls_summary-land1 = ls_customer-land1.
      ls_summary-count = 1.
      COLLECT ls_summary INTO lt_summary.
    ENDLOOP.',
3, 17, datetime('now', '-10 days'));

INSERT INTO lessons (module_id, title, content, position, duration_minutes, created_at) VALUES
(15, 'ALV Grid Reports — Displaying Data Professionally',
'## What is ALV?

ALV (ABAP List Viewer) is the standard SAP framework for displaying tabular data in reports. Every professional SAP report uses ALV — it provides sorting, filtering, export to Excel, and column configuration out of the box.

### Simple ALV with CL_SALV_TABLE

    DATA lt_data TYPE TABLE OF mara.
    SELECT matnr mtart matkl meins
      FROM mara INTO TABLE lt_data
      UP TO 100 ROWS.

    TRY.
      DATA lo_alv TYPE REF TO cl_salv_table.
      cl_salv_table=>factory(
        IMPORTING r_salv_table = lo_alv
        CHANGING  t_table      = lt_data ).

      lo_alv->display( ).

    CATCH cx_salv_msg INTO DATA(lx_msg).
      MESSAGE lx_msg->get_text( ) TYPE ''E''.
    ENDTRY.

This 12-line program produces a fully interactive, professional-looking ALV grid report.',
4, 19, datetime('now', '-9 days'));

-- ─── Module 16: Modularization and Object-Oriented ABAP ───

INSERT INTO lessons (module_id, title, content, position, duration_minutes, created_at) VALUES
(16, 'Subroutines (FORM/ENDFORM) and Function Modules',
'## Subroutines

Subroutines are local reusable code blocks within a single program.

    PERFORM display_message USING ''Hello'' ''World''.

    FORM display_message
      USING pv_word1 TYPE string
            pv_word2 TYPE string.
      WRITE: pv_word1, pv_word2.
    ENDFORM.

Note: Subroutines are legacy. Prefer methods in modern ABAP.

## Function Modules

Function modules are global, reusable procedures stored in Function Groups. They can be called from any ABAP program.

    CALL FUNCTION ''POPUP_TO_CONFIRM''
      EXPORTING
        titlebar       = ''Confirm Action''
        text_question  = ''Are you sure?''
      IMPORTING
        answer         = lv_answer.

### Key Difference

- Subroutines: local to one program
- Function modules: global, callable from anywhere, can be RFC-enabled (called remotely)',
1, 16, datetime('now', '-8 days'));

INSERT INTO lessons (module_id, title, content, position, duration_minutes, created_at) VALUES
(16, 'Introduction to Object-Oriented ABAP — Classes and Methods',
'## Why Object-Oriented ABAP?

Modern SAP development (BAdIs, Fiori, S/4HANA extensions) is class-based. Understanding OO ABAP is essential for working with any modern SAP system.

## Defining a Class

    CLASS zcl_employee DEFINITION.
      PUBLIC SECTION.
        DATA mv_name   TYPE string READ-ONLY.
        DATA mv_salary TYPE p DECIMALS 2 READ-ONLY.
        METHODS constructor IMPORTING iv_name   TYPE string
                                       iv_salary TYPE p DECIMALS 2.
        METHODS get_info RETURNING VALUE(rv_info) TYPE string.
    ENDCLASS.

    CLASS zcl_employee IMPLEMENTATION.
      METHOD constructor.
        mv_name   = iv_name.
        mv_salary = iv_salary.
      ENDMETHOD.

      METHOD get_info.
        rv_info = mv_name && '' earns '' && mv_salary.
      ENDMETHOD.
    ENDCLASS.

## Using the Class

    DATA lo_emp TYPE REF TO zcl_employee.
    lo_emp = NEW zcl_employee( iv_name = ''Alice'' iv_salary = ''75000'' ).
    WRITE lo_emp->get_info( ).',
2, 22, datetime('now', '-7 days'));

INSERT INTO lessons (module_id, title, content, position, duration_minutes, created_at) VALUES
(16, 'Inheritance, Interfaces, and Exception Classes',
'## Inheritance in ABAP

    CLASS zcl_manager DEFINITION INHERITING FROM zcl_employee.
      PUBLIC SECTION.
        DATA mv_team_size TYPE i.
        METHODS constructor IMPORTING iv_name      TYPE string
                                       iv_salary    TYPE p DECIMALS 2
                                       iv_team_size TYPE i.
        METHODS get_info REDEFINITION.
    ENDCLASS.

## Interfaces

Interfaces define a contract — any class implementing an interface must provide those methods.

    INTERFACE zif_printable.
      METHODS print.
    ENDINTERFACE.

    CLASS zcl_report DEFINITION.
      PUBLIC SECTION.
        INTERFACES zif_printable.
    ENDCLASS.

    CLASS zcl_report IMPLEMENTATION.
      METHOD zif_printable~print.
        WRITE ''Printing report...''.
      ENDMETHOD.
    ENDCLASS.

## Exception Classes

Modern error handling in ABAP uses exception classes:

    TRY.
      DATA(lv_result) = 100 / lv_divisor.
    CATCH cx_sy_zerodivide INTO DATA(lx_error).
      MESSAGE lx_error->get_text( ) TYPE ''W''.
    ENDTRY.',
3, 20, datetime('now', '-6 days'));

INSERT INTO lessons (module_id, title, content, position, duration_minutes, created_at) VALUES
(16, 'BAdIs and Enhancement Framework — Extending SAP Without Modifying Core',
'## What are BAdIs?

BAdIs (Business Add-Ins) are the SAP-approved way to add custom logic to standard SAP programs without modifying SAP''s source code. This is critical — modifications to standard SAP are overwritten during upgrades.

### The Enhancement Philosophy

Never modify SAP standard code. Instead:
1. Find the BAdI for the process you want to enhance
2. Create an implementation class
3. SAP calls your implementation automatically at the right point

### Finding BAdIs

Use transaction SE18 to search for available BAdIs in a process area.

### Implementing a BAdI

1. Go to SE19 → Create Implementation
2. Select the BAdI name (e.g., BADI_SD_SALES_ITEM)
3. SAP generates an implementation class shell
4. Write your custom logic in the method

### Common BAdIs by Area

| Area | BAdI Example |
|---|---|
| Sales | BADI_SD_SALES_ITEM |
| Materials | MB_DOCUMENT_BADI |
| FI Posting | AC_DOCUMENT |
| HR | HRPAD00INFTY |

## User Exits vs BAdIs

- **User Exits** — older approach, function module-based, limited to predefined spots
- **BAdIs** — modern approach, class-based, multiple implementations possible, filter-capable',
4, 18, datetime('now', '-5 days'));

-- Confirm final count
SELECT m.title as module, COUNT(l.id) as lesson_count
FROM modules m
LEFT JOIN lessons l ON l.module_id = m.id
WHERE m.course_id = 4
GROUP BY m.id, m.title
ORDER BY m.position;
