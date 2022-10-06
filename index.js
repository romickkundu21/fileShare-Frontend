
const dropZone=document.querySelector(".drop-zone");
const fileInput=document.querySelector("#fileinput");
const fileBrowse=document.querySelector(".browseFile");
const bgProgress=document.querySelector(".bg-progress");
const progressBar=document.querySelector(".progress-bar");
const progressContainer=document.querySelector(".progress-container");
const percentUpload=document.querySelector("#percent")
const title=document.querySelector('.title2');
const fileUrlInput=document.querySelector("#fileURL");
const sharingContainer=document.querySelector('.sharing-container');
const copyBtn=document.querySelector('#copy-btn')
const emailForm=document.querySelector('#emailForm')
const toast=document.querySelector('.toast');

const host="https://fileshare-21.herokuapp.com/";
const uploadURL=`${host}app/files`;
const emailURL=`${host}app/files/send`;

const maxAllowedSize=100*1024*1024;

dropZone.addEventListener("dragover",(e) =>{
    e.preventDefault();
    if(!dropZone.classList.contains("dragged")){
        dropZone.classList.add("dragged");
    }
})

fileInput.addEventListener("change", ()=>{
    uploadFile();
})

dropZone.addEventListener("dragleave",(e) =>{
    if(dropZone.classList.contains("dragged")){
        dropZone.classList.remove("dragged");
    }
})
dropZone.addEventListener("drop",(e) =>{
    e.preventDefault();
    dropZone.classList.remove("dragged");
    const files=e.dataTransfer.files;
    if(files.length){
        fileInput.files=files;
        uploadFile();
    }
})

fileBrowse.addEventListener("click",()=>{
    fileInput.click();
})

const uploadFile=()=>{
    progressContainer.style.display="block";
    if(fileInput.files.length > 1){
        fileInput.value="";
        showToast("Only upload one file");
        return;
    }
    const file=fileInput.files[0];

    if(file.size > maxAllowedSize){
        showToast("Can't Upload more than 100MB.")
        fileInput.value="";
        return;
    }

    const formData=new FormData();
    formData.append('myfile',file);
    const xhr=new XMLHttpRequest();

    xhr.onreadystatechange=() =>{
        if(xhr.readyState === XMLHttpRequest.DONE){
            console.log(xhr.response);
            onUploadSuccess(JSON.parse(xhr.response));
        }
    }

    xhr.upload.onprogress=updateProgress;
    xhr.upload.onerror=()=>{
        fileInput.value="";
        showToast(`Error in upload: ${xhr.statusText}`);
    }
    xhr.open('POST',uploadURL);
    xhr.send(formData);

}

const updateProgress = (e) =>{
    const percent=Math.round((e.loaded / e.total)*100);
    console.log(percent)
    bgProgress.style.width=`${percent}%`;
    percentUpload.innerHTML=percent;
    progressBar.style.transform=`scaleX(${percent/100})`
    if(percent===100){
        title.innerHTML="Uploaded";
    }
    
}

copyBtn.addEventListener("click",()=>{
    let newCopiedUrl=fileUrlInput.select();
    navigator.clipboard.writeText(newCopiedUrl);
    showToast("Link Copied");
   
})

const onUploadSuccess=({file:url})=>{
    console.log(url);
    fileInput.value="";
    emailForm[2].removeAttribute('disabled');
    progressContainer.style.display='none';
    sharingContainer.style.display="block";
    fileUrlInput.value=url;
}

emailForm.addEventListener("submit",(e)=>{
    e.preventDefault();
    const URL=fileUrlInput.value;
    const formData={
        uuid:URL.split('/').splice(-1,1)[0],
        emailTo:emailForm.elements["to-email"].value,
        emailFrom:emailForm.elements["from-email"].value,
    }
    emailForm[2].setAttribute('disabled', 'true');
    console.table(formData);
    fetch(emailURL,{
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
    }).then(res=>res.json()).then(({success})=>{
        if(success){
            sharingContainer.style.display="none";
            showToast("Email Send");
        }
    });
})
let toastTimer;
const showToast =(msg)=>{
    toast.innerHTML=msg;
    toast.style.transform="translate(-50%,0)";
    clearTimeout(toastTimer);
    toastTimer=setTimeout(()=>{
        toast.style.transform="translate(-50%,60px)";
    },2000)
}