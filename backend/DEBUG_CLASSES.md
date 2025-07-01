# Debug Classes Issue

## Steps to debug:

1. **Restart backend server** to apply changes
2. **Login as TEACHER** and try to create a class
3. **Check backend console logs** for:
   - `DEBUG createClass - currentUser:`
   - `DEBUG createClass - input before:`
   - `DEBUG createClass - auto-assigned teacherId:`
   - `DEBUG createClass - input after:`
   - `DEBUG ClassService.create - input:`
   - `DEBUG ClassService.create - model before save:`
   - `DEBUG ClassService.create - saved result:`

4. **Check frontend console logs** for:
   - `DEBUG teacherId:`
   - `DEBUG classesData:`
   - `DEBUG myClasses:`
   - `DEBUG comparing:`

5. **Check if class appears in dashboard**

## Expected behavior:
- TEACHER creates class → teacherId should be auto-assigned
- Class should appear in teacher's dashboard
- Class should appear in admin's dashboard

## Common issues:
- teacherId not being assigned correctly
- Query name mismatch (class vs getAllClasses)
- Data type mismatch in comparison
- Caching issues 