# done:
* poc entity view
* poc filter
* add git repository
* add docker compose
* push to new server
* create a copy of the db for the docker
* add auth
* auth - https://www.codemag.com/Article/2001081/Nest.js-Step-by-Step-Part-3-Users-and-Authentication
* remove show components
* add base components for list, edit & create
* fix custom referencing tables
* hebrew translation
* add admin role
* add admin wrapper
* rtl support - https://marmelab.com/react-admin/Theming.html
* fix crud auth filter
* add permissions
* add multi login for same user support - by add a column of 'effective user id' and using it to filter the results
* use vite for client
* add yemot controller
* add yemot simulator
* split yemot common & specific logic
* test user add
* test all table edit & add
* hangup a simulator after finish
* add dashboard stats
* check dashboard error
* fix reference input
* use npm package for common logic in client
* move to git sub modules
* fix quick filter
* use git submodule for common logic in server
* update dashboard ui
* use cookie instead of auth bearer
* don't use path ../ anywhere, use src/ instead
* import - https://stackoverflow.com/questions/72488424/upload-excel-data-into-database-using-nestjs
* import csv - https://www.npmjs.com/package/react-admin-import-csv?activeTab=readme https://www.npmjs.com/package/ra-import-csv
* add csv import
* organize client shared components folder
* join limitaion -  https://github.com/typeorm/typeorm/issues/1668
* export - try to add joins
* translate excel file name
* check how to download excel from response & use fetchJson func - use blob maybe
* export - implement pdf export - copy template from old website and use it to render pdf
* export pdf - https://stackoverflow.com/questions/64964827/nestjs-exporting-library-to-pdf-or-excel
https://github.com/tinovyatkin/nest-puppeteer
* add export to csv & pdf
* validate dns is pointing to ip address
* add domain name to site
* try to use caddy-docker-proxy - https://hub.docker.com/r/lucaslorentz/caddy-docker-proxy
* simplify docker compose file - why override domain everywhere?
* export base64 string to support netfree
* add csv & pdf options to export button
* handle date format in export
* make excel file look better
* make pdf file look better
* add a loader to export button
* fix rtl - https://mui.com/material-ui/guides/right-to-left/
* rtl in autocomplete
* maybe use dynamic modules or some other thing so we won't need to override every single function
* json-viewer for user permission & additional data - https://www.npmjs.com/package/react-admin-json-view?activeTab=readme
* https://marmelab.com/react-admin/Admin.html#title
* add export header names to all tables
* add filters - https://marmelab.com/react-admin/FilteringTutorial.html
* student klass report - QueryFailedError: Access denied for user 'user'@'%' (using password: YES)
* fix joining errors
* fix lessons.klasses text-align
* add student base klass view
* test filter by student base klass
* add years in all tables - check if can use null values
* import from email
* move import & export to a utils folder
* make student klass repot & sudent base klass generic
* make year column nullable
* use multi reference field
* add typeorm migration - all foreign keys are using id
* update in reference input
* add audit log - full preview of item instead of soft delete
* soft delete - https://github.com/nestjsx/crud/issues/433
* validate exports are working after change
* add support for order by of names
* לצרף את הטבלה רק אם היא מופיעה במיון
* save import file data in a table
* add get, post, put, delete function to data provider
* define a table for 'audit-log' & 'import-file' data
* update react admin version
* להוסיף רשימת קבצים שהועלו
* add yemot call module to dynamic modules
* enable reverting for imported file
* logs
* add sign up form
* update code-server
* test send mails
* self host n8n
* add mail addresses table
* add mail update n8n workflow
* add mail recieve in n8n
* add mail fallback in n8n
* לשפר תהליך טלפוני- לנסות לשים שם את התהליך הטלפוני של מאיר
* add recieve email webhook
* להוסיף אפשרות לבחור כתובות מייל
* add validation for mail address - also across domains
* update react admin
* update data-ui/crud version and use request.auth instead of injecting user data
* create github actions workflow
* check the use of request_parser.extra property
* fix error on importing file - field fileSource doesnt have a default value
* check why prod code is not updating - the files are updated, but the runnng code is the old code, proved by logs, only after deleting the containers his is fixed
* add json to report generators
* rename 'reportDefinition' to 'reportGenerator'
* simplify getReportData function from base-entity.service
* make student grade report work
* support multiple report generation at once - add buffer to pdf generator
* make student report card work for multiple selected ids
* add mail server for sending & receiving - https://docs.postalserver.io/
* rate limit backend requests
* use id column for relation everywhere
* support multiple report generation at once - add buffer to pdf generator
* add userId filter for admin user in all tables
* add user info fields to register form - שם, פלאפון מייל, שם המוסד, כתובת המוסד, טלפון המוסד. תפקיד
* translate all tables - including admin
* update date fields format
* search google how to send response mail with smtp server
* add permission to users table to shifi
* remove delete button from mail address list and users table for simple users
* make export function only one with extra.format for the format
* add api webhook for pivot - with support for more than one
* add subroute for students for pivot
* add explanation how to configure yemot phone to connect to the system
* add swagger - https://docs.nestjs.com/openapi/introduction
* rename id_copy1 to updated_at
* show pages data in a special page - in accordion
* check why updated_at column not updating
* render dynamic columns - student pivot - https://stackoverflow.com/questions/59321237/how-to-render-dynamic-fields-on-list-component-of-react-admin
* make sure class-validator works properly
* add class-validator to every entity
* add client side validation to every entity
* add BeforeUpdate to each BeforeInsert
* update pages - add order, order by order, add permission to add new page
* tranlate class-validator errors - https://github.com/typestack/class-validator/issues/169
* check why backend container at docker is not updated
* re-run migration scripts (referenceId) for demo.yoman.online
* add unique validator for mail address uniqueness
* add option to delete a mail address
* add logs for each request - https://www.npmjs.com/package/nestjs-pino
* hide month data from att_report - should not be used
* add 'impersonate' logic, impersonate button at users table, impersonate api in auth service, allow only for admins, in user data keep the data that it is impersonated, and on logout return admin user, save previousUserId on the jwt token and use it on impersonate end
* add new table - for report months - will have name, start date, end date
* new report for teachers report - teacher, month, sent lessons, not sent lessons
* change lessons.klasses field - make reference id field
* add new route - for any thing, not just reports
* the new report will have button to send email to teacher
* add send excel file to teacher in new teacher report
* check how to add lesson name in excel file email
* add report filters popup to bulk report button & bulk action button - and send data to server
* a new popup will be opened to edit the email message, with default value. mail subject will be in text table. 
* check if can add additional columns to excel that will not be read (student name etc) - yes, with '' as column name
* student pivot without teacher name - only lesson id
* student klass report doesn't work when has only studentReferenceId - it works on studentTz
* check what happens when email import is failing class-validator
* add to users table payment isPaid & payment method inputs
* user that didnt pay can't export any data - pdf or excel, can't download bulk report
* add to users table mail address alias & title from which will send emails
* better text management in db - no need to daclare each text so many times (join text table to users table and then back to text table, and have the base and override translation for each text)
* text management - how to edit existing translation or non-existing translation - maybe add special buttons for this, and use action for edit
* fix yemot - getExistingReports logic
* add filters to student attendance pivot
* add menu grouping - https://stackoverflow.com/questions/53336432/react-admin-create-sub-menu
* add icons to menu items
* show yemot simulator for admin
* add the ability to export pivot
* fiter dependant fields - lesson should depend on klass filter and on teacher filter
* add analytics to check popular pages and buttons
* align all texts in translation to same format - snake case
* fix yemot simulator with lesson confirm
* update excel file look
* add unique validator for student tz & (lesson key + year) & teacher tz & klass key per user
* add grade entity in client side
* fill some data in grade entity
* add dynamic filter in common reference input
* build a view for att_report and grade data
* add percents reports for students - based on student global report
* add a button on percents report to view student reports
* add export definition to percents report
* move filtersArr logic to a util file
* create show matching records button component
* add a default year filter
* check how the teacher excel should look like
* add default year value on server side for att-report, grade, lesson, student-klass
* add migration to fill year value if year is null or 0
* add impersonate button in user edit form
* email import - return good error message for non excel files
* add student percents report with dates
* fix show matching records with dates
* hide original student percents report
* show student klass table in student edit form - maybe even with option to create\update\delete
* add comment field to students table
* update react-admin
* fix teacher report view - check lesson dates with report month dates
* move student report to be react
* add a question to student report - if with grades or not
* move fillDefaultYearValue to be the first item
* add ability for html export for reports for investigations
* add unique validator on client side - https://marmelab.com/react-admin/useUnique.html
* think how can we use unique combination for bulk insert- maybe use back req.user
* add images table so users can edit images for reports - https://marmelab.com/react-admin/ImageInput.html
* change klass_type to handle track type for klass
* use import get from 'lodash/get'; everywhere with record[source]
* add option to have a custom email header for some tables - att-report & grade
* add importer columns to att report & grade
* update teacher report file to include more details
* check why report_date is failing save
* add reply to mail address to teacher report file
* add show matching report to uploaded files
* add year to students query in teacher report file
* add new view - student-by-year, (from student-klass) and use it everywhere
* change to use docker swarm for production - with github container repository
* create common auto complete and add noOptionsText translation
* fix student attendance list year at backend
* create a table of 'payment tracks' - with name, price and student number limit
* add field for user to have payment track
* add year filter for dashboard items - student too
* add ability to import excel files to att-report & grade
* add student number validation - based on student-by-year view
* add comment field to lesson table
* add new field to klass_type - teacher name
* return IsUniqueCombination
* move code-server & dev env to docker swarm
* copy validations from att-report entity to grade entity
* update react-admin
* put back unique for edit records
* translate field names in class-validator errors
* send student name on the phone before asking for absCount
* use studentReferenceId for idsToSkip
* absCount is 0 check why
* handle response from yemot when having an array
* yemot call - increase history column size & put back step data
* create script file to fix reference ids & run in production - save for later
* update StudentKlassReport to show klass ids with ReferenceArrayInput
* add scanner upload page
* teacher report - add lesson name to export file, and not only lesson id
* create att report with report month view
* add teacher name & lesson name parameters to teacher report file mail subject & body
* add ability to send teacher report file for specific lesson
* student attendance pivot should filter by klass
* show report month in att report table - add a new view for this
* on user creation - register, add default values for report months table
* create custom useUnique to add userId filter when admin
* add a new field to report month - first half, second half, full year, the field will be named 'semester'
* add to pivot filters of: dates, semester, report month
* fix delete for att_report_with_report_month
* add known absences table - student, klass, lesson, date, count, comment, reason, isApproved - default true
* add ability to import known absences from excel file
* add a view for known absences with report month
* add known absences to student pivot - filter by klass, dates, semester, report month
* make teacher-report mail subject & body editable via texts table
* add option to filter user input filter
* think how to show errors for sending teacher report file
* put back validation for validateUserHasPaid
* nest auto delete migration files
* auto width excel file columns on export
* split report generators to different files - one for each generator - maybe
* flip scanner upload logic
* add in lesson report screen
* add hebrew date field
* add slider input
* use slider input in in-lesson-report
* add lateCount for in-lesson-report, like the absCount
* update student report card to latest version - both the ejs & react
* student report card - order by klass type - first base klass then others
* add grade-att linking table, like in old website
* support bulk actions in readonly datagrids
* add roadmap compnent
* make end-of-page image in student report card stick to the bottom of the page
* add teacher report table for grades
* add late count to yemot report chain
* check elk logs are rotated - verify this
* check errors on n8n flows
* add success boolean to import file table
* put back netdata
* save bulk button params in local storage
* use grade name in student percent report, and only after that limit the grades between 0-100
* rename all db indexes to be meaningful
* make github action to run tests on pull request
* make sure all the db indexes have a meaningful name
* create function to get all student report data by dates, and use it in report card and in percent report
* add start date & end date to student report card
* add field of lessons - שיעורים ללא הגבלת תאריך - multiple lessons
* add a page for rashim file import - a simple page with one file input, and a button to send to server, server processes it and send back the filled file. can use student global report for that
* add percent view for students
* make dashboard items configurable - implement todos
* update react-admin version
* update icon for in-lesson-report
* make each menu icon unique
* finish auth service unit tests
* show last grade and not grade avg
* add bulk action on audit log table to revert changes
* add klass type filter to teacher salary report
* show yemot calls in a nice way, with all data & responses
* update react-admin version to v5
* add new 'comment' column to teachers table, and show it in teacher report table
* add ablity to insert multiple report dates on in-lesson-report
* add settings page
* make email rtl always
* save dashboard items in a table, and enable for users to edit them
* update n8n version
* add style editor in settings and use it in student report card
* increase test coverage for 'server' folder

# todo
* add pre-push test run
* add pre-commit test run
* add health check for all services
* 

# todo later
## infrastucture
* fix local dev dockerfile
* add more unit testing to client side
* check slow queries in kibana
* update react-admin version
* check docker security issues
* add gzip to caddy
* make sure db backup is saving only 7
* delete old docker logs
## new features
* add custom implementatino for max-length that works with numbers too
* re-structure student percents report - think how to do it with dates filter
* use known absences in all student reports
* use ra-components
* add user image to export pdf file
* add option to self connect to yemot phone
* if teacher doesn't have email - she will get a phone call - see knowledge file
* add ability to edit report templates
## bug fix
* check why cannot view pdf with some jpg image, probably new version of jpg - see image in troubleshoot folder, this is related to pdf-lib package
