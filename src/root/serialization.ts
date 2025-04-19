import dayjs from 'dayjs';
import type { Workspace, WorkspaceSvg } from 'blockly/core';
import { Projects, Project } from '../types/projects';


const ratio = 16/9;
const padding = 30;
const finalWidth = 250*2;

export function getProjects(): Projects {
    let projectsRaw = localStorage.getItem("roboxProjects")
    let projects = {}
    if (!projectsRaw) {
        localStorage.setItem("roboxProjects", "{}")
        projects = {}
    }
    else projects = JSON.parse(projectsRaw)
    return projects
}
export function createProject(name: string) {
    let projects = getProjects()
    let uuid = crypto.randomUUID();
    projects[uuid] = { name: name, time: dayjs(), workspace: {}, thumbnail: "" }
    localStorage.setItem("roboxProjects", JSON.stringify(projects))
    return uuid
}
export function getProject(uuid: string, projects: Projects | null = null): Project | null {
    if (!projects) {
        projects = getProjects()
    }
    if (Object.keys(projects).length === 0) return null
    if (projects[uuid] === undefined) return null
    return projects[uuid]
}
export async function loadBlockly(uuid: string, workspace: Workspace) {
    const blockly = await import('blockly/core');
    let project = getProject(uuid)
    if (!project) return;
    let workspaceData = project.workspace
    if (!workspaceData) return;
    blockly.Events.disable();
    blockly.serialization.workspaces.load(workspaceData, workspace, undefined);
    blockly.Events.enable();
}
export async function saveBlockly(uuid: string, workspace: WorkspaceSvg, callback: ((project: string) => void) | null = null) {
    const blockly = await import('blockly/core');
    workspaceToSvg_(workspace, (thumburi: string) => {
        const data = blockly.serialization.workspaces.save(workspace)
        let projects = getProjects()
        projects[uuid]["time"] = dayjs()
        projects[uuid]["workspace"] = data
        projects[uuid]["thumbnail"] = thumburi
        let projectData = JSON.stringify(projects)
        localStorage.setItem("roboxProjects", projectData)

        if (callback) callback(JSON.stringify(projects[uuid]));
    });
}

export function saveBlocklyCompressed(projectRaw: string) {
    // TODO: SAVEBLOCKLYCOMPRESSED REQUIRES FILE VALIDATION
    let projects = getProjects()
    let project = JSON.parse(projectRaw) as Project
    let uuid = crypto.randomUUID();
    projects[uuid] = project
    projects[uuid]["time"] = dayjs()
    let projectData = JSON.stringify(projects)
    localStorage.setItem("roboxProjects", projectData)
    return projectData
}

export function renameProject(uuid: string, newName:string) {
    let projects = getProjects()
    if (!projects[uuid]) throw new Error("Project does not exist")
    projects[uuid]["name"] = newName
    localStorage.setItem("roboxProjects", JSON.stringify(projects))
}
export function deleteProject(uuid: string) {
    let projects = getProjects()
    if (!projects[uuid]) throw new Error("Project does not exist")
    delete projects[uuid]
    localStorage.setItem("roboxProjects", JSON.stringify(projects))
}

/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Download screenshot.
 * @author samelh@google.com (Sam El-Husseini)
 */
function svgToPng_(data: string, width: number, height: number, callback: (url: string) => void) {
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");
    var img = new Image();

    var pixelDensity = finalWidth/width;
    canvas.width = width * pixelDensity;
    canvas.height = height * pixelDensity;
    img.onload = function () {
        if (!context) return
        context.drawImage(img, 0, 0, width, height, 0, 0, canvas.width, canvas.height);
        try {
            var dataUri = canvas.toDataURL('image/png');
            callback(dataUri);
        } catch (err) {
            console.warn('Error converting the workspace svg to a png');
            callback('');
        }
    };
    img.src = data;
}
function workspaceToSvg_(workspace: WorkspaceSvg, callback: (url: string) => void, customCss = "") {
    // Go through all text areas and set their value.
    var textAreas = document.getElementsByTagName("textarea");
    for (var i = 0; i < textAreas.length; i++) {
        textAreas[i].innerHTML = textAreas[i].value;
    }

    var bBox = workspace.getBlocksBoundingBox();
    var x = bBox.left;
    var y = bBox.top;
    var width = bBox.right - x;
    var height = bBox.bottom - y;

    if (width === 0 || height === 0) {
        width = 100;
        height = 100;
    }
    
    // Aspect ratio
    if (width>height) {
        y -= (width/ratio - height)/2;
        height = width / ratio;
    } else {
        x -= (height*ratio - width)/2;
        width = height * ratio;
    }

    var blockCanvas = workspace.getCanvas();
    
    var clone = blockCanvas.cloneNode(true) as SVGElement;
    clone.removeAttribute('transform');

    // Add padding
    x -= padding;
    y -= padding;
    width += padding*2;
    height += padding*2;


    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    let patterns = workspace.getParentSvg().querySelectorAll("defs");
    for (let pattern of patterns) {
        svg.appendChild(pattern.cloneNode(true));
    }
    if (!patterns || !patterns[0] || !patterns[0].firstChild) return ''
    let patternId = (patterns[0].firstChild as SVGDefsElement).id;
    let bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bgRect.setAttribute('width', "200%");
    bgRect.setAttribute('height', "200%");
    bgRect.setAttribute('x', x.toString());
    bgRect.setAttribute('y', y.toString());
    bgRect.setAttribute("style", `fill: url("#${patternId}"); transform: translate(-24px, -16px);`);
    svg.appendChild(bgRect);

    svg.appendChild(clone);
    svg.setAttribute('viewBox', x + ' ' + y + ' ' + width + ' ' + height);

    svg.setAttribute('class', 'blocklySvg ' +
        (workspace.options.renderer || 'geras') + '-renderer ' +
        (workspace.getTheme ? workspace.getTheme().name + '-theme' : ''));
    svg.setAttribute('width', width.toString());
    svg.setAttribute('height', height.toString());
    svg.setAttribute("style", 'background-color: #E6F0FF;');

    var css = [].slice.call(document.head.querySelectorAll('style'))
        .filter(function (el: HTMLStyleElement) {
            return /\.blocklySvg/.test(el.innerText) ||
                (el.id.indexOf('blockly-') === 0);
        }).map(function (el: HTMLStyleElement) {
            return el.innerText;
        }).join('\n');
    var style = document.createElement('style');
    style.innerHTML = css + '\n' + customCss;
    svg.insertBefore(style, svg.firstChild);

    var svgAsXML = (new XMLSerializer).serializeToString(svg);
    svgAsXML = svgAsXML.replace(/&nbsp/g, '&#160');
    var data = 'data:image/svg+xml,' + encodeURIComponent(svgAsXML);

    svgToPng_(data, width, height, callback);
}