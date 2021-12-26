import { AfterViewInit, Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { v4 as uuid } from 'uuid';
import { Observable, fromEvent } from "rxjs";
import { StudentListService } from "src/app/services/student-list.service";
import { debounceTime, distinctUntilChanged, filter, tap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {

  studentList: any = [];
  studentListArr: any = [];
  filterListArr: any = [];
  editing: boolean = false;
  gradeList = [1,2,3,4,5,6,7,8,9,10,11];
  classList = ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Indigo', 'Violet'];
  courseList = ['Science', 'Mathematics', 'English', 'History', 'Geography'];
  newStudent = {
    id: '',
    name: '',
    grade: null,
    classname: '',
    course_name: []
  }
  
  @ViewChild('name', {static: true}) name: ElementRef;
  @ViewChild('course_name', {static: true}) course_name: ElementRef;

  constructor(
    private studentListService: StudentListService,
  ) {}
  
  ngOnInit() {
    this.studentListService.GetStudents().subscribe(res => {
      this.studentList = res;
      let studentListSet = new Set(this.studentList.data.map(element => element.id))
      studentListSet.forEach(e =>{ 
        this.studentListArr.push({
          id: e,
          name: this.studentList.data.find(element => element.id === e).name,
          grade: this.studentList.data.find(element => element.id === e).grade,
          classname: this.studentList.data.find(element => element.id === e).classname,
          course_name: this.studentList.data.filter(element => element.id === e).map(element => element.course_name)
        })
      })
      this.filterListArr = this.studentListArr;
    })
  }

  edit() {
    this.editing = true;
  }

  cancel() {
    this.editing = false;
  }

  save(student) {
    this.editing = false;
    this.studentListService.updateStudent(student).subscribe(() => {
      console.log('Updated student successfully');
    })
  }
  
  checkCourse(course_name, current) {
    return course_name.includes(current);
  }

  onChange(name: string, isChecked: boolean) {
    if (isChecked) {
      this.newStudent.course_name.push(name);
    } else {
      this.newStudent.course_name = this.newStudent.course_name.filter(e => e !== name);
    }
  }

  onChangeEdit(name: string, isChecked: boolean, id: string) {
    let thisId = this.studentListArr.findIndex(e => e.id === id)
    if (isChecked) {
      this.studentListArr[thisId].course_name.push(name);
    } else {
      this.studentListArr[thisId].course_name = this.studentListArr[thisId].course_name.filter(e => e !== name);
    }
  }

  add() {
    this.newStudent.name = (<HTMLInputElement>document.getElementById('name')).value;
    this.newStudent.id = uuid();
    this.studentListArr.push({
          id: this.newStudent.id,
          name: this.newStudent.name,
          grade: this.newStudent.grade,
          classname: this.newStudent.classname,
          course_name: this.newStudent.course_name
    })

    this.studentListService.AddStudent(this.newStudent).subscribe(() => {
      console.log('Added student successfully')
    });
    
    (<HTMLInputElement>document.getElementById('name')).value = '';
    this.newStudent = {
      id: '',
      name: '',
      grade: null,
      classname: '',
      course_name: []
    }
  }

  delete(id: number): void {
    this.studentListService.deleteStudent(id).subscribe(() => {
      this.studentListArr = this.studentListArr.filter(e => {
        return e.id !== id
      })
    });
  }

  ngAfterViewInit() {
    fromEvent(this.name.nativeElement,'keyup')
            .pipe(
                filter(Boolean),
                debounceTime(500),
                distinctUntilChanged(),
                tap((event:KeyboardEvent) => {
                  this.studentListArr = this.filterListArr.filter(e => e.name.toLowerCase() === this.name.nativeElement.value.toLowerCase())
                  if(this.name.nativeElement.value === '') this.studentListArr = this.filterListArr;
                })
            )
            .subscribe();

    fromEvent(this.course_name.nativeElement,'keyup')
            .pipe(
                filter(Boolean),
                debounceTime(500),
                distinctUntilChanged(),
                tap((event:KeyboardEvent) => {
                  this.studentListArr = this.filterListArr.filter(e => e.course_name.includes(this.course_name.nativeElement.value))
                  if(this.course_name.nativeElement.value === '') this.studentListArr = this.filterListArr;
                })
            )
            .subscribe();
  }
}
